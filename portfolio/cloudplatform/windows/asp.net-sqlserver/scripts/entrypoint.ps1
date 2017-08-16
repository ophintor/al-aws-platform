Param(
  [String]$action = [Convert]::ToBase64String( [System.Text.Encoding]::Unicode.GetBytes("exit") )
)

$ErrorActionPreference = "Stop"

$env:ASPNETCORE_ENVIRONMENT = 'Production'

Set-Location -Path C:\app\sample-webapp\

Import-Module AWSPowerShell

$AWS_REGION=Invoke-RestMethod -uri http://169.254.169.254/latest/dynamic/instance-identity/document | select -exp region
Set-DefaultAWSRegion -Region $AWS_REGION

$INSTANCE_ID=Invoke-RestMethod -uri http://169.254.169.254/latest/meta-data/instance-id
$STACK_NAME=Get-EC2Tag -Filter @{ Name="resource-id";Values="$INSTANCE_ID"}, @{ Name="key";Values="aws:cloudformation:stack-name"} | select -exp value

Get-SSMParameterList | select -exp name | foreach {
  if($_ -match $STACK_NAME) {
    $out=(Get-SSMParameterValue -Name "$_" -WithDecryption $TRUE).Parameters | Select-Object -Property Name,Value
    [Environment]::SetEnvironmentVariable(($out.Name -replace "/$STACK_NAME/","" -replace "/","_").ToUpper(), $out.Value, "Process")
  }
}

PowerShell -EncodedCommand $action
