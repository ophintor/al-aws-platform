$ErrorActionPreference = "Stop"
try {
  Unregister-ScheduledTask -TaskName webapp -Confirm:$false
  Stop-Process -Name dotnet -Force
}
catch {
  Echo 'Application has not yet been started'
}

Echo "[WebApp] App stopped"
