#!/bin/bash

# Script to run database tests

echo "=========================================="
echo "Party-Time Database Testing Suite"
echo "=========================================="
echo ""

# Change to backend directory
cd /Users/rodrigo/code/party-time/backend

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

echo "Installing/updating dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

echo ""
echo "Checking Docker PostgreSQL..."
# Check if PostgreSQL container is running
if docker ps | grep -q party-time-db; then
    echo "✅ PostgreSQL container is running"
else
    echo "Starting PostgreSQL container..."
    cd ..
    docker-compose up -d postgres
    cd backend
    sleep 3  # Wait for PostgreSQL to start
fi

echo ""
echo "=========================================="
echo "Running Standalone Test Script"
echo "=========================================="
python test_db_setup.py

echo ""
echo "=========================================="
echo "Running pytest Database Tests"
echo "=========================================="
pytest tests/test_database.py -v --tb=short

echo ""
echo "=========================================="
echo "Test Summary Complete"
echo "=========================================="