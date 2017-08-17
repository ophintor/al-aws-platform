$ErrorActionPreference = "Stop"
$action = New-ScheduledTaskAction -Execute 'PowerShell.exe' -Argument '-NonInteractive -WindowStyle Hidden -NoLogo -File C:\app\scripts\launch.ps1'
$trigger = New-ScheduledTaskTrigger -Once -At (get-date).AddSeconds(5).ToString('HH:mm:ss')
$principal = New-ScheduledTaskPrincipal -UserID "NT AUTHORITY\SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -Force -Principal $principal -Action $action -Trigger $trigger -TaskName 'webapp' -Description 'dotnet core web app'
