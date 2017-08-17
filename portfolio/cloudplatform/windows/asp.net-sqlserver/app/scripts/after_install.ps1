$ErrorActionPreference = "Stop"
$Text = @"
dotnet restore
dotnet ef database update
"@

$Bytes = [System.Text.Encoding]::Unicode.GetBytes($Text)
$EncodedText = [Convert]::ToBase64String($Bytes)

C:\app\scripts\entrypoint.ps1 -action $EncodedText
