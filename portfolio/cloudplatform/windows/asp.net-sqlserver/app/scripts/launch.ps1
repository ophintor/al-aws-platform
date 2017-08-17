$ErrorActionPreference = "Stop"
$Text = @'
filter timestamp {"[$(Get-Date -Format u)] $_"}
Set-Location 'C:\app\bin\Debug\netcoreapp1.1\publish\'
& dotnet .\webapp.dll --server.urls http://*:$env:APP_PORT | timestamp | Out-File -Append -NoClobber -Encoding 'utf8' -FilePath C:\stdout
'@

$Bytes = [System.Text.Encoding]::Unicode.GetBytes($Text)
$EncodedText = [Convert]::ToBase64String($Bytes)

C:\app\scripts\entrypoint.ps1 -action $EncodedText
