#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-8014}"
HOST="${HOST:-0.0.0.0}"
PID_FILE="${PID_FILE:-/tmp/dragon-go-${PORT}.pid}"
LOG_FILE="${LOG_FILE:-/tmp/dragon-go-${PORT}.log}"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.telegram}"

LOCAL_BASE_URL="http://127.0.0.1:${PORT}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

first_ipv4() {
  local ip_addr=""

  if command -v ip >/dev/null 2>&1; then
    ip_addr="$(
      ip -4 route get 1.1.1.1 2>/dev/null \
        | awk '/src/ { for (i = 1; i <= NF; i += 1) if ($i == "src") { print $(i + 1); exit } }'
    )"
  fi

  if [[ -z "$ip_addr" ]]; then
    ip_addr="$(
      hostname -I 2>/dev/null \
        | awk '{ for (i = 1; i <= NF; i += 1) if ($i ~ /^[0-9]+\./) { print $i; exit } }'
    )"
  fi

  if [[ -z "$ip_addr" ]]; then
    echo "Could not detect a local IPv4 address." >&2
    exit 1
  fi

  printf '%s\n' "$ip_addr"
}

port_is_listening() {
  ss -ltn \
    | awk -v port=":${PORT}" '$4 ~ port"$" { found = 1 } END { exit(found ? 0 : 1) }'
}

page_is_served() {
  curl -fsSI "${LOCAL_BASE_URL}/kassa_dragon.html" >/dev/null 2>&1
}

start_server() {
  if port_is_listening; then
    if page_is_served; then
      echo "Server is already running on port ${PORT}."
      return
    fi

    echo "Port ${PORT} is busy, but it is not serving DRAGON GO." >&2
    echo "Use another port, for example: PORT=8015 ./start_kassa_server.sh" >&2
    exit 1
  fi

  nohup python3 -m http.server "${PORT}" --bind "${HOST}" --directory "${ROOT_DIR}" >"${LOG_FILE}" 2>&1 &
  local server_pid=$!
  echo "${server_pid}" >"${PID_FILE}"

  for _ in 1 2 3 4 5; do
    if page_is_served; then
      echo "Server started on port ${PORT}."
      return
    fi
    sleep 1
  done

  echo "Failed to start the local server. Check ${LOG_FILE}" >&2
  exit 1
}

load_telegram_env() {
  if [[ -f "${ENV_FILE}" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "${ENV_FILE}"
    set +a
  fi
}

build_message() {
  local lan_base_url="$1"

  cat <<EOF
<b>DRAGON GO local server</b>
Wi-Fi IP: <code>${LAN_IP}</code>
Port: <code>${PORT}</code>

Kassa:
${lan_base_url}/kassa_dragon.html

Kitchen monitor:
${lan_base_url}/monitor_kuhnhya.html

Client monitor:
${lan_base_url}/monitor_klient.html

Menu:
${lan_base_url}/menu.html

Home:
${lan_base_url}/HOME.html

Works only inside the same Wi-Fi network.
EOF
}

send_to_telegram() {
  local message="$1"

  if [[ -z "${TELEGRAM_BOT_TOKEN:-}" || -z "${TELEGRAM_CHAT_ID:-}" ]]; then
    echo "Telegram send skipped: set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID." >&2
    return 0
  fi

  local api_url="https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage"
  local curl_args=(
    --fail
    --silent
    --show-error
    --request POST
    --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}"
    --data-urlencode "parse_mode=HTML"
    --data-urlencode "disable_web_page_preview=true"
    --data-urlencode "text=${message}"
  )

  if [[ -n "${TELEGRAM_THREAD_ID:-}" ]]; then
    curl_args+=(--data-urlencode "message_thread_id=${TELEGRAM_THREAD_ID}")
  fi

  curl "${curl_args[@]}" "${api_url}" >/dev/null
  echo "Links sent to Telegram."
}

print_links() {
  local lan_base_url="$1"

  printf '\n%s\n' "DRAGON GO links"
  printf 'Local:   %s/\n' "${LOCAL_BASE_URL}"
  printf 'Wi-Fi:   %s/\n' "${lan_base_url}"
  printf 'Kassa:   %s/kassa_dragon.html\n' "${lan_base_url}"
  printf 'Kitchen: %s/monitor_kuhnhya.html\n' "${lan_base_url}"
  printf 'Client:  %s/monitor_klient.html\n' "${lan_base_url}"
  printf 'Menu:    %s/menu.html\n' "${lan_base_url}"
  printf 'Home:    %s/HOME.html\n' "${lan_base_url}"
  printf 'Log:     %s\n' "${LOG_FILE}"
  printf 'PID:     %s\n' "${PID_FILE}"
}

require_cmd python3
require_cmd curl
require_cmd ss

load_telegram_env
start_server

LAN_IP="$(first_ipv4)"
LAN_BASE_URL="http://${LAN_IP}:${PORT}"
MESSAGE="$(build_message "${LAN_BASE_URL}")"

print_links "${LAN_BASE_URL}"
send_to_telegram "${MESSAGE}"
