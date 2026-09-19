Drop the favicon set here, using exactly these filenames — index.html already
links to all of them, so nothing else needs changing once they land:

  favicon.ico            16 + 32 px, multi-size .ico  (browser tabs, legacy)
  favicon.svg            any size, vector             (modern browsers, scales)
  favicon-96x96.png      96 x 96                      (fallback for no-SVG)
  apple-touch-icon.png   180 x 180, no transparency   (iOS home screen)

A file that isn't here yet just 404s; the others still work.
