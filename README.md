# DRAGON-GO

Static PWA project for DRAGON GO.

## Pages

- `index.html` - QR / install landing page.
- `dragon.com.html` - delivery-style restaurant list.
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

## Kassa Launch Script

Run:

```bash
./start_kassa_server.sh
```

The script:

- starts the local server on port `8014`
- prints local and Wi-Fi links for `kassa`, `menu`, and both monitors
- sends those Wi-Fi links to Telegram if `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set

Optional Telegram env file:

```bash
.env.telegram
```

Supported variables:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TELEGRAM_THREAD_ID`
- `PORT`

## PWA

- `manifest.json` controls install behavior.
- `sw.js` caches the app shell.
- PWA start page is `dragon.com.html`.
