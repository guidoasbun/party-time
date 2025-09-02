# MCP Setup for Party-Time Development

This document outlines the Model Context Protocol (MCP) servers configured for the Party-Time project.

## 🔥 Important: Development vs Production Database

**Current PostgreSQL Setup**: The Docker PostgreSQL container is **FOR DEVELOPMENT ONLY**
- **Purpose**: Local development, testing, rapid iteration
- **Host**: localhost:5432 (Docker container)
- **Data**: Sample/test data that can be safely deleted
- **Cost**: Free

**Production Database** (Week 11 deployment):
- **Service**: AWS RDS PostgreSQL 16
- **Infrastructure**: Managed by Terraform
- **Features**: Automated backups, high availability, VPC security
- **Migration**: Alembic will handle schema deployment to RDS

## Installed MCP Servers

### 1. PostgreSQL MCP (`postgresql`)
- **Package**: `enhanced-postgres-mcp-server`
- **Purpose**: Direct database access, queries, and schema management
- **Connection**: `postgresql://party_admin:party_secure_2024@localhost:5432/party_time`
- **Usage**: Database operations during development, testing queries, data exploration

### 2. Memory MCP (`memory`)
- **Package**: `@modelcontextprotocol/server-memory`
- **Purpose**: Persistent memory across Claude conversations
- **Usage**: Store project decisions, architecture choices, code patterns, API keys

### 3. Git MCP - Party-Time (`party-time-git`)
- **Package**: `mcp-server-git` (via uvx)
- **Repository**: `/Users/rodrigo/code/party-time`
- **Purpose**: Git operations specific to the Party-Time project
- **Usage**: Commit tracking, branch management, project-specific git operations

### 4. Fetch MCP (`fetch`)
- **Package**: `mcp-server-fetch` (via uvx)
- **Purpose**: HTTP requests and API testing
- **Usage**: Test external APIs (Google Places, AWS services, Stripe)

### 5. General Git MCP (`git`)
- **Package**: `mcp-server-git` (via uvx)
- **Repository**: `/Users/rodrigo/.oh-my-zsh` (existing configuration)
- **Purpose**: General git operations

## Configuration Location

The MCP configuration is stored at:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

## Usage Examples for Party-Time Development

### Week 1-2: Foundation Setup
```
Using PostgreSQL MCP:
- Create and modify database schema
- Insert test data
- Query user authentication data
- Test database relationships

Using Memory MCP:
- Store database connection details
- Remember chosen libraries and frameworks
- Track architectural decisions
```

### Week 3-4: Event & Guest Management
```
Using PostgreSQL MCP:
- Test event CRUD operations
- Query guest list data
- Verify RSVP token generation
- Test guest-event relationships

Using Git MCP:
- Track feature branch progress
- Manage commits for event management features
```

### Week 5-6: RSVP & Email Integration
```
Using Fetch MCP:
- Test AWS SES API endpoints
- Verify email template rendering
- Test RSVP webhook endpoints

Using PostgreSQL MCP:
- Query RSVP response data
- Test email tracking tables
```

### Week 7-8: Venue & Budget Features
```
Using Fetch MCP:
- Test Google Places API integration
- Verify venue search results
- Test budget calculation APIs

Using PostgreSQL MCP:
- Query budget categories and expenses
- Test venue data storage
- Verify complex budget queries
```

## Development Commands

### Start PostgreSQL Container
```bash
docker-compose up -d postgres
```

### Test Database Connection
```bash
export PGPASSWORD=party_secure_2024
psql -h localhost -U party_admin -d party_time -c "SELECT version();"
```

### Restart Claude Desktop
After making MCP configuration changes, restart Claude Desktop to reload the servers.

## Troubleshooting

### PostgreSQL MCP Issues
- Ensure PostgreSQL container is running: `docker-compose ps`
- Test direct connection with psql first
- Check connection string format in claude_desktop_config.json

### Memory MCP Issues
- Memory data is stored locally and persists across conversations
- Clear memory if needed by restarting the MCP server

### Git MCP Issues
- Ensure the repository path exists and is accessible
- Check git status in the repository directory

## Weekly MCP Usage Plan

| Week | Primary MCPs | Purpose |
|------|-------------|---------|
| 1-2  | PostgreSQL, Memory, Git | Schema creation, auth system |
| 3-4  | PostgreSQL, Git, Memory | Event/guest management |
| 5-6  | PostgreSQL, Fetch, Memory | RSVP & email systems |
| 7-8  | PostgreSQL, Fetch, Git | Venue search, budget tracking |
| 9-11 | All MCPs | Testing, deployment, polish |
| 12-13| All MCPs | Advanced features, documentation |

This MCP setup provides comprehensive tooling for efficient Party-Time development across all 13 weeks of the project timeline.