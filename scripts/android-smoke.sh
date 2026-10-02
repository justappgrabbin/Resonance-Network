#!/usr/bin/env bash
set -euo pipefail

APK="${1:-android/app/build/outputs/apk/release/app-release.apk}"
PKG="com.stellarproximology.resonancenetwork"
ACTIVITY="$PKG/.MainActivity"
OUT_DIR="${SMOKE_OUT_DIR:-build-artifacts/android-smoke}"
mkdir -p "$OUT_DIR"

log(){ printf '[android-smoke] %s\n' "$*"; }

screen_height(){
  adb shell wm size | tr -d '\r' | sed -n 's/.*x\([0-9][0-9]*\)$/\1/p' | tail -1
}

dump_ui(){
  adb shell uiautomator dump /sdcard/window.xml >/dev/null 2>&1 || true
  adb pull /sdcard/window.xml "$OUT_DIR/window.xml" >/dev/null 2>&1 || true
}

find_node(){
  local needle="$1"
  dump_ui
  python - "$OUT_DIR/window.xml" "$needle" <<'PY'
import re,sys,xml.etree.ElementTree as ET
path,needle=sys.argv[1],sys.argv[2]
try:
    root=ET.parse(path).getroot()
except Exception:
    raise SystemExit(1)
for node in root.iter('node'):
    text=node.attrib.get('text','')
    desc=node.attrib.get('content-desc','')
    if needle in text or needle in desc:
        b=node.attrib.get('bounds','')
        m=re.match(r'\[(\-?\d+),(\-?\d+)\]\[(\-?\d+),(\-?\d+)\]',b)
        if m:
            x1,y1,x2,y2=map(int,m.groups())
            print(f'{(x1+x2)//2} {(y1+y2)//2}')
            raise SystemExit(0)
raise SystemExit(1)
PY
}

wait_for(){
  local needle="$1"; local attempts="${2:-40}"
  for ((i=1;i<=attempts;i++)); do
    if find_node "$needle" >/dev/null 2>&1; then
      log "found: $needle"
      return 0
    fi
    sleep 2
  done
  dump_ui
  log "FAILED waiting for: $needle"
  cat "$OUT_DIR/window.xml" || true
  return 1
}

tap_node(){
  local needle="$1"
  local height
  height="$(screen_height)"
  height="${height:-1920}"
  for ((attempt=1;attempt<=7;attempt++)); do
    local xy x y
    if xy="$(find_node "$needle" 2>/dev/null)"; then
      read -r x y <<<"$xy"
      if (( y > 80 && y < height - 120 )); then
        log "tap: $needle @ $x $y"
        adb shell input tap "$x" "$y"
        sleep 1
        return 0
      fi
    fi
    log "scrolling to: $needle"
    adb shell input swipe 540 $((height-280)) 540 420 350
    sleep 1
  done
  dump_ui
  log "cannot tap missing/off-screen node: $needle"
  return 1
}

enter_text(){
  local label="$1" value="$2"
  tap_node "$label"
  adb shell input text "$value"
  adb shell input keyevent 4 || true
  sleep 1
}

log "installing $APK"
adb install -r "$APK"
adb shell am force-stop "$PKG"
adb shell am start -W -n "$ACTIVITY" | tee "$OUT_DIR/launch.txt"
wait_for "SOVEREIGN LOCAL COMPUTER"
wait_for "Create Profile"

tap_node "Create Profile"
wait_for "Create a resonance profile"
enter_text "Name" "SmokeTest"
enter_text "Latitude" "0"
enter_text "Longitude" "0"
tap_node "Calculate + Save Profile"
wait_for "RESONANCE IDENTITY" 60
wait_for "SmokeTest" 10

tap_node "Human Design BodyGraph Data"
wait_for "HUMAN DESIGN LAYER" 40
adb shell input keyevent 4
wait_for "RESONANCE IDENTITY"

tap_node "Astrology Triad"
wait_for "ASTROLOGY TRIAD" 40
adb shell input keyevent 4
wait_for "RESONANCE IDENTITY"

adb shell input keyevent 4
wait_for "SOVEREIGN LOCAL COMPUTER"
wait_for "SmokeTest"

tap_node "Open Cynthia"
wait_for "PERSONAL COGNITION" 30
adb shell input keyevent 4
wait_for "SOVEREIGN LOCAL COMPUTER"

tap_node "Open Stellar"
wait_for "STELLAR PROXIMOLOGY" 30
adb shell input keyevent 4
wait_for "SOVEREIGN LOCAL COMPUTER"

tap_node "Open Relationship"
wait_for "RELATIONSHIP" 30
adb shell input keyevent 4
wait_for "SOVEREIGN LOCAL COMPUTER"

tap_node "Open Timing"
wait_for "TIMING" 60
adb shell input keyevent 4
wait_for "SOVEREIGN LOCAL COMPUTER"

tap_node "Open Import / Export"
wait_for "PORTABLE" 30
adb shell input keyevent 4
wait_for "SOVEREIGN LOCAL COMPUTER"

tap_node "Open Capabilities"
wait_for "CAPABILITY / PLUGIN REGISTRY" 30
adb shell input keyevent 4
wait_for "SOVEREIGN LOCAL COMPUTER"

log "verifying persistence across process restart"
adb shell am force-stop "$PKG"
adb shell am start -W -n "$ACTIVITY" | tee "$OUT_DIR/relaunch.txt"
wait_for "SOVEREIGN LOCAL COMPUTER" 30
wait_for "SmokeTest" 30

dump_ui
adb exec-out screencap -p > "$OUT_DIR/final-home.png"
adb shell dumpsys activity activities > "$OUT_DIR/dumpsys-activity.txt"
if ! grep -q "$PKG" "$OUT_DIR/dumpsys-activity.txt"; then
  log "package is not in resumed activity state"
  exit 1
fi

log "PASS: launch, home, profile creation, Human Design, astrology, Cynthia, Stellar, relationship, timing, portability, capabilities, and persistence"
