#!/usr/bin/env bash
# Resonance v13 -> York -> Android APK
# Builds in a disposable York copy; never modifies the canonical York compiler or source HTML.
set -Eeuo pipefail
IFS=$'\n\t'

say(){ printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }
die(){ printf '\n[FAIL] %s\n' "$*" >&2; exit 1; }

HOME="${HOME:-/data/data/com.termux/files/home}"
STAMP="$(date +%Y%m%d-%H%M%S)"
ROOT="$HOME/.synthia-game-builds/resonance-computer/$STAMP"
LOG="$ROOT/build.log"
mkdir -p "$ROOT"
exec > >(tee -a "$LOG") 2>&1

say "Resonance v13 York build"
echo "Workspace: $ROOT"
echo "Preservation: source HTML and canonical York remain untouched"

if [ ! -d "$HOME/storage" ]; then
  say "Requesting Android storage access"
  termux-setup-storage || true
fi

need_pkg(){
  local cmd="$1" pkg="$2"
  if ! command -v "$cmd" >/dev/null 2>&1; then pkg install -y "$pkg" || die "Could not install $pkg"; fi
  command -v "$cmd" >/dev/null 2>&1 || die "Missing command after install: $cmd"
}
need_pkg unzip unzip
need_pkg zip zip

DOWNLOAD_DIRS=("$HOME/storage/downloads" "$HOME/storage/Download" "/sdcard/Download" "/sdcard/Downloads")
find_latest_file(){
  local pattern="$1" found="" d
  for d in "${DOWNLOAD_DIRS[@]}"; do
    [ -d "$d" ] || continue
    while IFS= read -r f; do
      if [ -z "$found" ] || [ "$f" -nt "$found" ]; then found="$f"; fi
    done < <(find "$d" -maxdepth 3 -type f -iname "$pattern" 2>/dev/null || true)
  done
  printf '%s' "$found"
}

COMPUTER_HTML="${COMPUTER_HTML:-}"
if [ -z "$COMPUTER_HTML" ]; then COMPUTER_HTML="$(find_latest_file 'Synthia-Resonance-Computer-Integrated*.html')"; fi
[ -n "$COMPUTER_HTML" ] && [ -f "$COMPUTER_HTML" ] || die "Resonance v13 integrated HTML not found in Downloads."

EXPECTED_HTML_SHA256="a0666009a22eefac5854cb1d6bcfb2378ba9902116292fe0671d0625b78811d3"
ACTUAL_HTML_SHA256="$(sha256sum "$COMPUTER_HTML" | awk '{print $1}')"
[ "$ACTUAL_HTML_SHA256" = "$EXPECTED_HTML_SHA256" ] || die "Wrong v13 snapshot. Expected $EXPECTED_HTML_SHA256 but got $ACTUAL_HTML_SHA256"
say "Verified exact v13 computer snapshot"

CANONICAL_YORK=""
if [ -f "$HOME/.synthia-anyfile-builder/YORK.yaml" ] && [ -f "$HOME/.synthia-anyfile-builder/build-any.sh" ]; then
  CANONICAL_YORK="$HOME/.synthia-anyfile-builder"
else
  YORK_ZIP="${YORK_ZIP:-}"
  if [ -z "$YORK_ZIP" ]; then YORK_ZIP="$(find_latest_file 'Synthia-Foolproof-Compile-Ready*.zip')"; fi
  [ -n "$YORK_ZIP" ] && [ -f "$YORK_ZIP" ] || die "York compiler not installed and Synthia-Foolproof-Compile-Ready*.zip was not found in Downloads."
  mkdir -p "$ROOT/york-extract"
  unzip -q "$YORK_ZIP" '*/builder/*' -d "$ROOT/york-extract" || die "Could not extract York builder"
  CANONICAL_YORK="$(find "$ROOT/york-extract" -type f -name YORK.yaml -print -quit | xargs -r dirname)"
  [ -n "$CANONICAL_YORK" ] && [ -f "$CANONICAL_YORK/build-any.sh" ] || die "YORK.yaml/build-any.sh not found in compiler archive"
fi

YORK_WORK="$ROOT/york-builder"
cp -a "$CANONICAL_YORK" "$YORK_WORK"
[ -f "$YORK_WORK/YORK.yaml" ] || die "York copy failed"

if [ -d "$YORK_WORK/FILES-HERE" ]; then mv "$YORK_WORK/FILES-HERE" "$YORK_WORK/FILES-HERE.ORIGINAL"; fi
mkdir -p "$YORK_WORK/FILES-HERE"
cp "$COMPUTER_HTML" "$YORK_WORK/FILES-HERE/index.html"
printf '%s\n' 'index.html' > "$YORK_WORK/FILES-HERE/START.txt"

PACKAGE='com.resonance.computer'
LABEL='Resonance'
OLD_JAVA="$YORK_WORK/src/com/synthia/anyfile/MainActivity.java"
NEW_JAVA_DIR="$YORK_WORK/src/com/resonance/computer"
[ -f "$OLD_JAVA" ] || die "York MainActivity.java missing"
mkdir -p "$NEW_JAVA_DIR"
sed 's/^package com\.synthia\.anyfile;/package com.resonance.computer;/' "$OLD_JAVA" > "$NEW_JAVA_DIR/MainActivity.java"

if ! grep -q 'setAllowFileAccessFromFileURLs' "$NEW_JAVA_DIR/MainActivity.java"; then
  sed -i '/s.setAllowFileAccess(true);/a\    s.setAllowFileAccessFromFileURLs(true);\n    s.setAllowUniversalAccessFromFileURLs(true);' "$NEW_JAVA_DIR/MainActivity.java"
fi
if grep -q 'WebSettings s' "$NEW_JAVA_DIR/MainActivity.java" && ! grep -q 'setDomStorageEnabled' "$NEW_JAVA_DIR/MainActivity.java"; then
  sed -i '/WebSettings s/a\    s.setDomStorageEnabled(true);\n    s.setDatabaseEnabled(true);\n    s.setMediaPlaybackRequiresUserGesture(false);' "$NEW_JAVA_DIR/MainActivity.java"
fi

MAN="$YORK_WORK/AndroidManifest.xml"
if ! grep -q 'android.permission.INTERNET' "$MAN"; then
  sed -i '/<manifest/a\  <uses-permission android:name="android.permission.INTERNET" />' "$MAN"
fi
if ! grep -q 'android.permission.RECORD_AUDIO' "$MAN"; then
  sed -i '/<manifest/a\  <uses-permission android:name="android.permission.RECORD_AUDIO" />' "$MAN"
fi
sed -i \
  -e 's/package="com\.synthia\.anyfile"/package="com.resonance.computer"/' \
  -e "s/android:label=\"Synthia AnyFile\"/android:label=\"$LABEL\"/" \
  -e 's/android:name="com\.synthia\.anyfile\.MainActivity"/android:name="com.resonance.computer.MainActivity"/' \
  "$MAN"

sed -i 's#PACKAGE_PATH="$PROJECT_DIR/src/com/synthia/anyfile"#PACKAGE_PATH="$PROJECT_DIR/src/com/resonance/computer"#' "$YORK_WORK/build-any.sh"

say "Compiling Resonance v13 with York"
cd "$YORK_WORK"
chmod +x build-any.sh
APK_NAME="Resonance-v13-$STAMP.apk" ./build-any.sh || die "York APK build failed. Full log: $LOG"

APK="$(find "$HOME/storage/downloads" "$HOME/storage/Download" -type f -name "Resonance-v13-$STAMP.apk" -print -quit 2>/dev/null || true)"
if [ -z "$APK" ]; then APK="$(find "$HOME/storage/downloads/Synthia-AnyFile" -type f -name "*.apk" -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -1 | cut -d' ' -f2-)"; fi
[ -n "$APK" ] && [ -s "$APK" ] || die "York finished but no APK could be located. Check $LOG"

say "APK CREATED"
ls -lh "$APK"
sha256sum "$APK"
echo "APK=$APK"
echo "LOG=$LOG"
if command -v termux-open >/dev/null 2>&1; then termux-open "$APK" || true; fi
