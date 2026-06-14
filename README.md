# DRAGON-GO

Static PWA project for DRAGON GO.

## Pages

- `index.html` - QR / install landing page.
- `HOME.html` - delivery-style restaurant list.
- `menu.html` - client menu / Web App.
- `profil.html` - profile page used by the menu.

## Run Locally

```bash
python3 -m http.server 8014
```

Open:

```text
http://127.0.0.1:8014/
```

## PWA

- `manifest.json` controls install behavior.
- `sw.js` caches the app shell.
- PWA start page is `HOME.html`.

