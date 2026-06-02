#!/bin/bash
# Agendei. - APK Auto-Build Script
set -e

echo "============================================="
echo "🚀 Iniciando Compilação do APK do Agendei. 🚀"
echo "============================================="

# Get base path
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 1. Install dependencies and compile Vite app
echo "📦 1. Compilando o frontend React/Vite (Cliente)..."
cd "$BASE_DIR/mobile"
npm run build

# 2. Sync Capacitor with Android native project
echo "🔄 2. Sincronizando com o Capacitor..."
npx cap sync android

# 3. Build APK using native Gradle
echo "🐘 3. Compilando o APK via Gradle..."
cd "$BASE_DIR/mobile/android"
chmod +x gradlew
./gradlew assembleRelease

echo "============================================="
echo "🎉 APK Compilado com Sucesso! 🎉"
echo "📍 O arquivo APK Release está localizado em:"
echo "   $BASE_DIR/mobile/android/app/build/outputs/apk/release/app-release-unsigned.apk"
echo "👉 Dica: Para compilar em modo de testes imediatos, use 'assembleDebug' no Gradle."
echo "============================================="
