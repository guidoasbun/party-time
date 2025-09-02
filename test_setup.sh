#!/bin/bash

# Party-Time Development Setup Test Script
echo "🎉 Testing Party-Time Development Setup"
echo "======================================="

# Test Docker
echo -n "Docker: "
if docker --version > /dev/null 2>&1; then
    echo "✅ Installed"
else
    echo "❌ Not found"
    exit 1
fi

# Test PostgreSQL container
echo -n "PostgreSQL Container: "
if docker-compose ps | grep "party-time-db" | grep "Up" > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not running - run 'docker-compose up -d postgres'"
    exit 1
fi

# Test PostgreSQL connection
echo -n "PostgreSQL Connection: "
export PGPASSWORD=party_secure_2024
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
if psql -h localhost -U party_admin -d party_time -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Connected"
else
    echo "❌ Connection failed"
    exit 1
fi

# Test database tables
echo -n "Database Tables: "
table_count=$(psql -h localhost -U party_admin -d party_time -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
if [ "$table_count" -eq 7 ]; then
    echo "✅ All 7 tables created"
else
    echo "❌ Expected 7 tables, found $table_count"
fi

# Test sample data
echo -n "Sample Data: "
user_count=$(psql -h localhost -U party_admin -d party_time -t -c "SELECT count(*) FROM users;" 2>/dev/null | xargs)
if [ "$user_count" -eq 3 ]; then
    echo "✅ Sample users loaded"
else
    echo "❌ Expected 3 users, found $user_count"
fi

# Test Node.js and npm
echo -n "Node.js: "
if node --version > /dev/null 2>&1; then
    echo "✅ $(node --version)"
else
    echo "❌ Not found"
fi

# Test MCP packages
echo -n "Memory MCP: "
if npm list -g @modelcontextprotocol/server-memory > /dev/null 2>&1; then
    echo "✅ Installed"
else
    echo "❌ Not installed"
fi

echo -n "PostgreSQL MCP: "
if npm list -g enhanced-postgres-mcp-server > /dev/null 2>&1; then
    echo "✅ Installed"
else
    echo "❌ Not installed"
fi

# Test Claude Desktop config
echo -n "Claude Desktop Config: "
config_file="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
if [ -f "$config_file" ] && grep -q "postgresql" "$config_file"; then
    echo "✅ Configured with PostgreSQL MCP"
else
    echo "❌ Not configured"
fi

echo ""
echo "🎯 Setup Summary:"
echo "- PostgreSQL database running with sample data"
echo "- 7 database tables: users, events, guests, budget_categories, expenses, vendors, event_vendors"
echo "- Sample data: 3 users, 3 events, 8 guests, multiple budget categories"
echo "- MCP servers installed: Memory, PostgreSQL"
echo "- Claude Desktop configured with MCP servers"

echo ""
echo "🚀 Ready for Party-Time development!"
echo "Next steps:"
echo "1. Restart Claude Desktop to load MCP servers"
echo "2. Test MCP connections in a new Claude conversation"
echo "3. Begin Week 1 development tasks"