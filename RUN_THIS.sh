#!/bin/bash

# IntelliDoc AI - Quick Start Script
# This script will help you get started quickly

echo "🚀 IntelliDoc AI - Quick Start"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Environment files are already configured!"
echo ""
echo "Choose your setup method:"
echo ""
echo "1) Docker (Recommended - Easiest)"
echo "2) Manual Setup (More Control)"
echo "3) Just install dependencies"
echo "4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🐳 Starting with Docker..."
        echo ""
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed. Please install Docker first:"
            echo "   https://docs.docker.com/get-docker/"
            exit 1
        fi
        
        # Check if Docker Compose is installed
        if ! command -v docker-compose &> /dev/null; then
            echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
            echo "   https://docs.docker.com/compose/install/"
            exit 1
        fi
        
        echo "📦 Building and starting containers..."
        docker-compose up -d
        
        echo ""
        echo "⏳ Waiting for services to start (30 seconds)..."
        sleep 30
        
        echo ""
        echo "✅ Services started!"
        echo ""
        echo "🌐 Access your application:"
        echo "   Frontend:    http://localhost:5173"
        echo "   Backend:     http://localhost:5000"
        echo "   AI Service:  http://localhost:8000"
        echo "   API Docs:    http://localhost:8000/docs"
        echo ""
        echo "📝 To view logs: docker-compose logs -f"
        echo "🛑 To stop: docker-compose down"
        ;;
        
    2)
        echo ""
        echo "🔧 Manual Setup Selected"
        echo ""
        echo "Step 1: Installing Backend Dependencies..."
        cd backend
        npm install
        cd ..
        
        echo ""
        echo "Step 2: Installing AI Service Dependencies (this may take 10-15 minutes)..."
        cd ai-service
        pip install -r requirements.txt
        cd ..
        
        echo ""
        echo "✅ Dependencies installed!"
        echo ""
        echo "Now open 3 terminals and run:"
        echo ""
        echo "Terminal 1 (Backend):"
        echo "  cd backend && npm run dev"
        echo ""
        echo "Terminal 2 (AI Service):"
        echo "  cd ai-service && uvicorn main:app --reload --port 8000"
        echo ""
        echo "Terminal 3 (Frontend):"
        echo "  cd frontend && npm run dev"
        echo ""
        ;;
        
    3)
        echo ""
        echo "📦 Installing Dependencies Only..."
        echo ""
        
        echo "Installing Backend Dependencies..."
        cd backend
        npm install
        cd ..
        
        echo ""
        echo "Installing AI Service Dependencies..."
        cd ai-service
        pip install -r requirements.txt
        cd ..
        
        echo ""
        echo "✅ All dependencies installed!"
        echo ""
        echo "To start services manually, see START_HERE.md"
        ;;
        
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "📚 For more information, see:"
echo "   - START_HERE.md - Quick start guide"
echo "   - CREDENTIALS.md - Your configuration"
echo "   - QUICK_REFERENCE.md - Common commands"
echo ""
echo "🎉 Happy coding!"
