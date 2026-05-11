<#
.SYNOPSIS
  Start, stop, restart or check the FishLog dev server.

.DESCRIPTION
  Wrapper around `npm run dev:lan` that runs detached, with proper PATH
  refresh and clean shutdown (kills the whole process tree, not just the
  listening port, so RAM is fully released).

.PARAMETER Action
  start | stop | restart | status | logs

.EXAMPLE
  .\fishlog.ps1 start
  .\fishlog.ps1 stop
  .\fishlog.ps1 status
  .\fishlog.ps1 logs        # tails dev.log
#>

[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [ValidateSet('start', 'stop', 'restart', 'status', 'logs')]
  [string]$Action = 'status'
)

$ErrorActionPreference = 'Stop'
$ProjectDir = $PSScriptRoot
$LogFile    = Join-Path $ProjectDir 'dev.log'
$Port       = 3000

# Always refresh PATH from the registry — winget installs (node/supabase/docker)
# only land in the parent session, not in long-lived shells.
function Sync-EnvPath {
  $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $user    = [Environment]::GetEnvironmentVariable('Path', 'User')
  $env:Path = "$machine;$user"
}

function Get-DevPids {
  $pids = @()
  # Anything listening on our port.
  try {
    $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) { if ($c.OwningProcess -ne 0) { $pids += $c.OwningProcess } }
  } catch {}
  # Any leftover node.exe whose command line points at this project.
  try {
    $nodes = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue
    foreach ($n in $nodes) {
      if ($n.CommandLine -and (
            $n.CommandLine -like '*fishlog*' -or
            $n.CommandLine -like '*next*dev*'
         )) {
        $pids += [int]$n.ProcessId
      }
    }
  } catch {}
  $pids | Sort-Object -Unique
}

function Stop-DevServer {
  $pids = Get-DevPids
  if (-not $pids -or $pids.Count -eq 0) {
    Write-Host 'No FishLog dev process is running.' -ForegroundColor Yellow
    return $false
  }
  foreach ($procPid in $pids) {
    # taskkill with /T walks the process tree (npm -> node -> workers).
    # /F forces. We swallow output but report PIDs.
    & taskkill.exe /PID $procPid /T /F 2>&1 | Out-Null
    Write-Host "Killed PID $procPid (with children)" -ForegroundColor DarkGray
  }
  # Sanity: re-check the port.
  Start-Sleep -Milliseconds 600
  $still = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if ($still) {
    Write-Host "Warning: port $Port still listening." -ForegroundColor Yellow
    return $false
  }
  Write-Host "Stopped. Port $Port is free." -ForegroundColor Green
  return $true
}

function Start-DevServer {
  Sync-EnvPath
  $existing = Get-DevPids
  if ($existing -and $existing.Count -gt 0) {
    Write-Host 'FishLog dev is already running. Use restart or stop first.' -ForegroundColor Yellow
    Show-Status
    return
  }

  if (-not (Test-Path (Join-Path $ProjectDir 'package.json'))) {
    throw "package.json not found in $ProjectDir"
  }

  # Wipe previous log so `logs` action shows only this run.
  Set-Content -LiteralPath $LogFile -Value '' -Encoding utf8

  # Detached background launch via cmd.exe so the npm/node tree survives the
  # current shell. -WindowStyle Hidden keeps it invisible; output is captured
  # to dev.log for the `logs` action.
  $cmdLine = '/c npm run dev:lan > "' + $LogFile + '" 2>&1'
  $proc = Start-Process -FilePath 'cmd.exe' `
                        -ArgumentList $cmdLine `
                        -WorkingDirectory $ProjectDir `
                        -WindowStyle Hidden `
                        -PassThru

  Write-Host "Starting (cmd PID $($proc.Id))..." -ForegroundColor Cyan

  # Wait up to 60s for the port to come up — first build downloads cert /
  # compiles middleware and can take a while.
  $deadline = (Get-Date).AddSeconds(60)
  while ((Get-Date) -lt $deadline) {
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
      Write-Host "Up on https://localhost:$Port" -ForegroundColor Green
      Show-Status
      return
    }
    Start-Sleep -Seconds 2
  }
  Write-Host "Timed out waiting for port $Port. Check logs:" -ForegroundColor Yellow
  Write-Host "  .\fishlog.ps1 logs"
}

function Show-Status {
  Sync-EnvPath
  $pids = Get-DevPids
  if (-not $pids -or $pids.Count -eq 0) {
    Write-Host 'FishLog dev: STOPPED' -ForegroundColor Red
    return
  }
  Write-Host 'FishLog dev: RUNNING' -ForegroundColor Green
  $rows = foreach ($procPid in $pids) {
    $p = Get-Process -Id $procPid -ErrorAction SilentlyContinue
    if (-not $p) { continue }
    [pscustomobject]@{
      PID    = $p.Id
      MB     = [math]::Round($p.WorkingSet64 / 1MB, 1)
      Name   = $p.ProcessName
      Up_s   = [int]((Get-Date) - $p.StartTime).TotalSeconds
    }
  }
  $rows | Format-Table -AutoSize | Out-String | Write-Host

  $totalMb = ($rows | Measure-Object MB -Sum).Sum
  Write-Host ("Total: {0} MB across {1} process(es)" -f $totalMb, $rows.Count) -ForegroundColor DarkGray

  # Show what URLs are reachable (LAN IP).
  $ips = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
         Where-Object {
           $_.IPAddress -match '^(192\.168|10\.|172\.(1[6-9]|2\d|3[0-1]))' -and
           $_.InterfaceAlias -notmatch 'vEthernet|Loopback'
         } |
         Select-Object -ExpandProperty IPAddress -Unique
  Write-Host ''
  Write-Host "URLs:" -ForegroundColor Cyan
  Write-Host "  https://localhost:$Port"
  foreach ($ip in $ips) { Write-Host "  https://${ip}:$Port" }
}

function Show-Logs {
  if (-not (Test-Path $LogFile)) {
    Write-Host 'No log file yet. Start the server first.' -ForegroundColor Yellow
    return
  }
  Get-Content -Path $LogFile -Tail 80 -Wait
}

switch ($Action) {
  'start'   { Start-DevServer }
  'stop'    { [void](Stop-DevServer) }
  'restart' {
    [void](Stop-DevServer)
    Start-Sleep -Seconds 1
    Start-DevServer
  }
  'status'  { Show-Status }
  'logs'    { Show-Logs }
}
