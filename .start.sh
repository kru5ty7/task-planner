#!/bin/bash

# Task Planner Startup Script
set -e

echo "🚀 Starting Task Planner setup and launch..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start the development server
echo "🌐 Starting the development server..."
echo "If port 3000 is in use, the server will prompt for an alternative port."
npm start