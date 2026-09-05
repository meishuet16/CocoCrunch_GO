Add-Type -AssemblyName System.Drawing
$repoRoot = Split-Path $PSScriptRoot -Parent
$sourcePath = Join-Path $repoRoot 'src/assets/coco/source/coco-canonical-sheet.png'
$outputRoot = Join-Path $repoRoot 'src/assets/coco/extracted'
[System.IO.Directory]::CreateDirectory($outputRoot) | Out-Null
$sheet = [System.Drawing.Bitmap]::FromFile($sourcePath)
$regions = @()
# Coordinates are source pixels, measured against the supplied 1536 x 1024 sheet.
# Each movement row has an independent top/bottom to exclude printed labels.
$rows = @(@('down', 72, 106), @('left', 181, 111), @('right', 289, 120), @('up', 412, 111))
$columns = @(@('idle', 59, 90), @('walk-a', 176, 84), @('passing', 292, 84), @('walk-b', 410, 83))
foreach ($row in $rows) {
  foreach ($column in $columns) {
    $regions += @{name="coco-move-$($row[0])-$($column[0])"; label="$($row[0]) / $($column[0])"; purpose='Directional movement frame'; x=[int]$column[1]; y=[int]$row[1]; width=[int]$column[2]; height=[int]$row[2]}
  }
}
$contact = New-Object System.Drawing.Bitmap(640, 640)
$contactGraphics = [System.Drawing.Graphics]::FromImage($contact)
$contactGraphics.Clear([System.Drawing.Color]::FromArgb(255,255,248,230))
$font = New-Object System.Drawing.Font('Arial', 9)
$manifest = @()
$index = 0
foreach ($region in $regions) {
  $rect = New-Object System.Drawing.Rectangle($region.x,$region.y,$region.width,$region.height)
  $crop = $sheet.Clone($rect,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  # Shared canvas keeps scale/ground alignment stable across the 16 movement frames.
  $frame = New-Object System.Drawing.Bitmap(128,128)
  $graphics = [System.Drawing.Graphics]::FromImage($frame)
  $graphics.DrawImageUnscaled($crop,[int][Math]::Floor((128-$crop.Width)/2),120-$crop.Height)
  $file = "$($region.name).png"
  $frame.Save((Join-Path $outputRoot $file),[System.Drawing.Imaging.ImageFormat]::Png)
  $cx = ($index % 4)*160
  $cy = [Math]::Floor($index/4)*160
  $contactGraphics.DrawImageUnscaled($frame,$cx+16,$cy)
  $contactGraphics.DrawString($region.label,$font,[System.Drawing.Brushes]::Black,$cx+5,$cy+134)
  $manifest += @{sourceRegion=@($region.x,$region.y,$region.width,$region.height); canonicalLabel=$region.label; semanticPurpose=$region.purpose; outputFile="src/assets/coco/extracted/$file"; canvas=@(128,128)}
  $graphics.Dispose(); $frame.Dispose(); $crop.Dispose()
  $index++
}
$contact.Save((Join-Path $outputRoot 'movement-contact.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$contactGraphics.Dispose(); $contact.Dispose(); $font.Dispose()
$poseGroups = @{
  expression = @(
    @('normal',547,45,113,129), @('happy',672,45,118,129), @('excited',789,44,120,130), @('sparkle',916,45,111,133),
    @('thinking',542,207,116,99), @('confused',667,207,120,99), @('worried',789,207,123,99), @('sweat',915,207,110,101),
    @('tired',545,340,116,119), @('sleepy',665,340,121,119), @('angry',788,340,124,119), @('shocked',916,340,110,123),
    @('proud',539,483,120,121), @('sad',666,485,121,119), @('love',789,483,120,121), @('panic',913,487,113,117)
  )
  action = @(
    @('map',1044,47,113,132), @('photo',1176,48,111,133), @('binoculars',1294,47,119,134), @('gps',1412,47,124,134),
    @('journal',1040,210,132,123), @('drink',1176,211,108,123), @('snack',1290,210,118,124), @('suggest',1410,210,126,124),
    @('luggage',1037,366,134,126), @('bags',1174,367,112,123), @('umbrella',1286,361,131,128), @('transit',1420,365,116,125),
    @('pack',1039,518,134,110), @('unpack',1175,518,108,110), @('rest',1290,518,124,110), @('celebrate',1414,518,122,110)
  )
  scene = @(
    @('home',24,670,132,133), @('planning',204,658,181,145), @('court',397,657,167,147), @('gacha',595,658,152,145),
    @('packing',763,670,160,135), @('traveling',958,657,161,147), @('memory-trunk',1140,657,192,148), @('empty',1344,678,164,127)
  )
}
foreach ($group in @('expression','action','scene')) {
  $poses = $poseGroups[$group]
  $board = New-Object System.Drawing.Bitmap(880,([int][Math]::Ceiling($poses.Count/4)*220))
  $boardGraphics = [System.Drawing.Graphics]::FromImage($board)
  $boardGraphics.Clear([System.Drawing.Color]::FromArgb(255,255,248,230))
  $poseFont = New-Object System.Drawing.Font('Arial', 11)
  $poseIndex = 0
  foreach ($pose in $poses) {
    $rect = New-Object System.Drawing.Rectangle($pose[1],$pose[2],$pose[3],$pose[4])
    $crop = $sheet.Clone($rect,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $frame = New-Object System.Drawing.Bitmap(208,176)
    $graphics = [System.Drawing.Graphics]::FromImage($frame)
    $graphics.DrawImageUnscaled($crop,[int][Math]::Floor((208-$crop.Width)/2),168-$crop.Height)
    $file = "coco-$group-$($pose[0]).png"
    $frame.Save((Join-Path $outputRoot $file),[System.Drawing.Imaging.ImageFormat]::Png)
    $cx = ($poseIndex % 4)*220
    $cy = [Math]::Floor($poseIndex/4)*220
    $boardGraphics.DrawImageUnscaled($frame,$cx+6,$cy)
    $boardGraphics.DrawString("$group / $($pose[0])",$poseFont,[System.Drawing.Brushes]::Black,$cx+5,$cy+182)
    $manifest += @{sourceRegion=@($pose[1],$pose[2],$pose[3],$pose[4]); canonicalLabel="$group / $($pose[0])"; semanticPurpose="$group pose, selected by UI context"; outputFile="src/assets/coco/extracted/$file"; canvas=@(208,176)}
    $graphics.Dispose(); $frame.Dispose(); $crop.Dispose()
    $poseIndex++
  }
  $board.Save((Join-Path $outputRoot "$group-contact.png"),[System.Drawing.Imaging.ImageFormat]::Png)
  $boardGraphics.Dispose(); $board.Dispose(); $poseFont.Dispose()
}
# Generated manifest is reproducible data, never a second hand-maintained crop map.
$manifestDocument = @{source='src/assets/coco/source/coco-canonical-sheet.png'; dimensions=@($sheet.Width,$sheet.Height); sourceSha256=(Get-FileHash $sourcePath -Algorithm SHA256).Hash; assets=$manifest}
[System.IO.File]::WriteAllText((Join-Path $outputRoot 'manifest.json'),($manifestDocument | ConvertTo-Json -Depth 8))
Write-Output "Source dimensions: $($sheet.Width) x $($sheet.Height)"
$sheet.Dispose()
Write-Output "Generated $($manifest.Count) semantic assets and four inspection boards."
