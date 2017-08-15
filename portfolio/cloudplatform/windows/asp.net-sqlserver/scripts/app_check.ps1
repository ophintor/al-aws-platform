$ErrorActionPreference = "Stop"

$Text = @'
For ($i=0; $i -lt 30; ++$i) {

  Try {
    $STATUS_CODE = Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:$env:APP_PORT -ErrorAction Stop
    Start-Sleep -s 1
  }

  Catch {
    if ($i -eq 29){
        Echo "ERROR: Application is not healthy!"
        Exit 1
    }
  }

  Finally {
    If ($STATUS_CODE.statuscode -eq 200){
      Echo "OK Application is healthy!"
      Exit 0
    }
  }
}
'@

$Bytes = [System.Text.Encoding]::Unicode.GetBytes($Text)
$EncodedText = [Convert]::ToBase64String($Bytes)

C:\app\scripts\entrypoint.ps1 -action $EncodedText
