The favicon set. index.html links favicon-32x32.png, favicon-16x16.png,
favicon.ico and apple-touch-icon.png directly, plus site.webmanifest, which
is what points at the two android-chrome files.

  favicon-16x16 / -32x32      what a browser tab actually renders
  favicon.ico                 48x48, fallback for anything asking for an .ico
  apple-touch-icon            180x180, iOS home screen
  android-chrome-192 / -512   referenced from site.webmanifest, not from HTML
  favicon-48 / -64 / -128 /
  -256 / -512                 spare sizes, not linked from anywhere

Icon paths inside site.webmanifest are relative to the manifest itself, so
the whole set stays movable as one folder.
