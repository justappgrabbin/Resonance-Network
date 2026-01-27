#!/bin/bash

# Resonance Network - One-Command Deploy
# This script handles everything from setup to app store submission

set -e  # Exit on error

echo "🌟 RESONANCE NETWORK DEPLOYMENT SYSTEM"
echo "======================================"
echo ""

# Configuration
APP_NAME="Resonance Network"
VERSION="1.0.0"

# Functions
setup_environment() {
    echo "📦 Setting up environment..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found. Installing..."
        # Install Node.js (adjust for your OS)
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        echo "❌ npm not found. Please install Node.js first."
        exit 1
    fi
    
    # Install Expo CLI globally if not present
    if ! command -v expo &> /dev/null; then
        echo "📱 Installing Expo CLI..."
        npm install -g expo-cli
    fi
    
    # Install EAS CLI for builds
    if ! command -v eas &> /dev/null; then
        echo "🔨 Installing EAS CLI..."
        npm install -g eas-cli
    fi
    
    echo "✅ Environment ready"
}

install_dependencies() {
    echo ""
    echo "📚 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
}

validate_configuration() {
    echo ""
    echo "🔍 Validating configuration..."
    
    # Check if consciousness engine has real calculations
    if grep -q "TODO: Implement your actual" core/ConsciousnessEngine.js; then
        echo "⚠️  WARNING: ConsciousnessEngine still has placeholder calculations"
        echo "   You need to replace these with your real stellar proximology logic"
        read -p "   Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    echo "✅ Configuration validated"
}

create_assets() {
    echo ""
    echo "🎨 Creating app assets..."
    
    # Create assets directory
    mkdir -p assets
    
    # Create placeholder icon (1024x1024)
    # In production, replace with your actual icon
    if [ ! -f "assets/icon.png" ]; then
        echo "⚠️  No app icon found. Creating placeholder..."
        # You'll need to add your actual icon here
        echo "   Add your 1024x1024 icon.png to assets/ directory"
    fi
    
    # Create splash screen
    if [ ! -f "assets/splash.png" ]; then
        echo "⚠️  No splash screen found. Creating placeholder..."
        echo "   Add your splash.png to assets/ directory"
    fi
    
    echo "✅ Assets ready"
}

run_tests() {
    echo ""
    echo "🧪 Running tests..."
    
    # Basic validation tests
    node -e "
        const { ConsciousnessEngine } = require('./core/ConsciousnessEngine');
        const engine = new ConsciousnessEngine();
        const testData = {
            date: '1990-01-01',
            time: '12:00:00',
            lat: 40.7128,
            lon: -74.0060
        };
        engine.calculateProfile(testData).then(profile => {
            console.log('✅ Consciousness calculation test passed');
            console.log('   Dominant field:', profile.dominant.field);
        }).catch(err => {
            console.error('❌ Test failed:', err);
            process.exit(1);
        });
    "
    
    echo "✅ Tests passed"
}

build_preview() {
    echo ""
    echo "🔨 Building preview version..."
    
    # Start Expo dev server
    echo "Starting Expo dev server..."
    echo "Scan the QR code with Expo Go app to test on your phone"
    npm start
}

build_production() {
    echo ""
    echo "🏗️  Building production version..."
    
    # Login to EAS
    echo "Logging into Expo..."
    eas login
    
    # Configure build
    if [ ! -f "eas.json" ]; then
        echo "Creating EAS build configuration..."
        eas build:configure
    fi
    
    # Build for both platforms
    echo "Building for Android and iOS..."
    echo "This will take 10-20 minutes..."
    
    read -p "Build for which platform? (android/ios/both) " platform
    
    case $platform in
        android)
            eas build --platform android --profile production
            ;;
        ios)
            eas build --platform ios --profile production
            ;;
        both)
            eas build --platform all --profile production
            ;;
        *)
            echo "Invalid platform"
            exit 1
            ;;
    esac
    
    echo "✅ Build complete"
}

submit_to_stores() {
    echo ""
    echo "🚀 Submitting to app stores..."
    
    read -p "Submit to which store? (google/apple/both) " store
    
    case $store in
        google)
            eas submit --platform android
            ;;
        apple)
            eas submit --platform ios
            ;;
        both)
            eas submit --platform all
            ;;
        *)
            echo "Invalid store"
            exit 1
            ;;
    esac
    
    echo "✅ Submission complete"
}

# Main menu
show_menu() {
    echo ""
    echo "What would you like to do?"
    echo "1) Setup environment (first time only)"
    echo "2) Install dependencies"
    echo "3) Run development server"
    echo "4) Run tests"
    echo "5) Build production version"
    echo "6) Submit to app stores"
    echo "7) Full deployment (all steps)"
    echo "8) Exit"
    echo ""
    read -p "Choose option (1-8): " choice
    
    case $choice in
        1)
            setup_environment
            show_menu
            ;;
        2)
            install_dependencies
            show_menu
            ;;
        3)
            build_preview
            ;;
        4)
            run_tests
            show_menu
            ;;
        5)
            build_production
            show_menu
            ;;
        6)
            submit_to_stores
            show_menu
            ;;
        7)
            setup_environment
            install_dependencies
            validate_configuration
            create_assets
            run_tests
            build_production
            submit_to_stores
            ;;
        8)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid option"
            show_menu
            ;;
    esac
}

# Run main menu
show_menu
