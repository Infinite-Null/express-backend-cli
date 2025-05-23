#!/bin/bash

# Node.js Express Template CLI Installation Script

echo "🚀 Installing Node.js Express Template CLI..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo "✅ npm $(npm -v) detected"

# Install the CLI globally
echo "📦 Installing create-node-api globally..."
npm install -g node-express-backend-cli

# Check if installation was successful
if command -v create-node-api &> /dev/null; then
    echo "✅ Installation successful!"
    echo ""
    echo "🎉 You can now use the CLI with:"
    echo "   create-node-api [project-name]"
    echo ""
    echo "📖 For help, run:"
    echo "   create-node-api --help"
else
    echo "❌ Installation failed. Please try manual installation:"
    echo "   npm install -g node-express-backend-cli"
fi