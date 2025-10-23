# Architecture Plan - Finch SQL

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Connection │  │    Query     │  │   Schema         │   │
│  │  Manager    │  │    Editor    │  │   Explorer       │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│         │                 │                    │             │
│         └─────────────────┴────────────────────┘             │
│                           │                                  │
│                    TanStack Router                           │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                     Tauri IPC Bridge
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                  Backend (Rust/Tauri)                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Command Handlers                        │    │
│  │  - connect_db()    - execute_query()                │    │
│  │  - disconnect_db() - get_tables()                   │    │
│  │  - test_connection() - get_schema()                 │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       │                                      │
│  ┌────────────────────┴────────────────────────────────┐    │
│  │         Connection Pool Manager                      │    │
│  │  - Manage multiple database connections             │    │
│  │  - Connection state management                      │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       │                                      │
│  ┌────────────────────┴────────────────────────────────┐    │
│  │              SQLx Integration                        │    │
│  │  - PostgreSQL driver                                │    │
│  │  - Query execution                                  │    │
│  │  - Connection pooling                               │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   PostgreSQL    │
                  │    Database     │
                  └─────────────────┘
```

## Core Components

### 1. Frontend Layer (React + TypeScript)

#### Connection Manager
- **Purpose**: Manage database connections
- **Features**:
  - Connection form (host, port, database, username, password)
  - Save/load connection profiles
  - Test connection before saving
  - Connection status indicator
  - Recent connections list

#### Query Editor
- **Purpose**: Execute SQL queries
- **Features**:
  - SQL syntax highlighting
  - Auto-completion
  - Query history
  - Result grid display
  - Export results (CSV, JSON)
  - Multiple query tabs

#### Schema Explorer
- **Purpose**: Browse database structure
- **Features**:
  - Tree view of databases, schemas, tables
  - Table structure viewer (columns, types, constraints)
  - Quick actions (view data, copy table name)
  - Search functionality

### 2. Backend Layer (Rust + Tauri)

#### Tauri Commands
Core commands exposed to frontend:

```rust
// Connection Management
connect_database(config: ConnectionConfig) -> Result<String>
disconnect_database(connection_id: String) -> Result<()>
test_connection(config: ConnectionConfig) -> Result<bool>
list_connections() -> Result<Vec<Connection>>

// Query Execution
execute_query(connection_id: String, query: String) -> Result<QueryResult>
execute_statement(connection_id: String, statement: String) -> Result<ExecutionResult>

// Schema Operations
get_databases(connection_id: String) -> Result<Vec<Database>>
get_schemas(connection_id: String, database: String) -> Result<Vec<Schema>>
get_tables(connection_id: String, schema: String) -> Result<Vec<Table>>
get_table_info(connection_id: String, table: String) -> Result<TableInfo>
get_columns(connection_id: String, table: String) -> Result<Vec<Column>>
```

#### Connection Pool Manager
- Maintain active connections
- Handle connection lifecycle
- Implement connection timeout
- Thread-safe connection access

#### SQLx Integration
- Use SQLx for PostgreSQL connectivity
- Async query execution
- Type-safe SQL queries
- Connection pooling

### 3. Data Models

#### Connection Configuration
```typescript
interface ConnectionConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  type: 'postgresql' | 'mysql'; // for future
}
```

#### Query Result
```typescript
interface QueryResult {
  columns: Column[];
  rows: Row[];
  rowCount: number;
  executionTime: number;
}

interface Column {
  name: string;
  type: string;
}

type Row = Record<string, any>;
```

#### Table Info
```typescript
interface TableInfo {
  name: string;
  schema: string;
  columns: ColumnInfo[];
  primaryKeys: string[];
  foreignKeys: ForeignKey[];
  indexes: Index[];
}
```

## Security Considerations

1. **Credential Storage**
   - Use Tauri's secure storage API
   - Encrypt passwords before storing
   - Never log sensitive information

2. **SQL Injection Prevention**
   - Use parameterized queries via SQLx
   - Validate and sanitize inputs

3. **Connection Security**
   - Support SSL/TLS connections
   - Validate certificates

## Data Flow

### Connection Flow
1. User enters connection details in UI
2. Frontend sends `connect_database` command to Rust backend
3. Backend validates configuration
4. SQLx establishes connection to PostgreSQL
5. Connection added to pool with unique ID
6. Success/failure returned to frontend
7. UI updates with connection status

### Query Execution Flow
1. User enters SQL query in editor
2. Frontend sends `execute_query` command with connection ID
3. Backend retrieves connection from pool
4. SQLx executes query
5. Results serialized to JSON
6. Frontend receives and displays results in grid

## File Structure

```
finch-sql/
├── src/                          # Frontend source
│   ├── components/
│   │   ├── connection/
│   │   │   ├── ConnectionForm.tsx
│   │   │   ├── ConnectionList.tsx
│   │   │   └── ConnectionStatus.tsx
│   │   ├── query/
│   │   │   ├── QueryEditor.tsx
│   │   │   ├── ResultGrid.tsx
│   │   │   └── QueryHistory.tsx
│   │   └── schema/
│   │       ├── SchemaExplorer.tsx
│   │       ├── TableViewer.tsx
│   │       └── TreeView.tsx
│   ├── hooks/
│   │   ├── useConnection.ts
│   │   ├── useQuery.ts
│   │   └── useSchema.ts
│   ├── services/
│   │   └── tauri-api.ts         # Tauri command wrappers
│   └── types/
│       └── database.ts          # TypeScript types
│
├── src-tauri/
│   ├── src/
│   │   ├── commands/
│   │   │   ├── connection.rs    # Connection commands
│   │   │   ├── query.rs         # Query commands
│   │   │   └── schema.rs        # Schema commands
│   │   ├── db/
│   │   │   ├── pool.rs          # Connection pool
│   │   │   ├── postgres.rs      # PostgreSQL implementation
│   │   │   └── mod.rs
│   │   ├── models/
│   │   │   ├── connection.rs
│   │   │   ├── query.rs
│   │   │   └── schema.rs
│   │   ├── error.rs             # Error types
│   │   ├── lib.rs
│   │   └── main.rs
│   └── Cargo.toml
```

## Phase 1: MVP Features (PostgreSQL)

### Core Features
1. ✅ Single PostgreSQL connection
2. ✅ Connection testing
3. ✅ Basic query execution
4. ✅ Display query results in table
5. ✅ List tables in database
6. ✅ View table structure

### Nice-to-Have
- Save connection profiles
- Query history
- Syntax highlighting
- Auto-completion
- Multiple connection tabs

## Phase 2: Enhanced Features

1. Multiple simultaneous connections
2. Advanced query editor
3. Schema explorer with tree view
4. Export functionality
5. Query performance metrics
6. Connection encryption

## Phase 3: MySQL Support

1. Add MySQL driver
2. Abstract database interface
3. Database-specific query syntax
4. Unified UI for both databases

## Technology Decisions

### Why SQLx?
- Compile-time checked queries
- Async support
- Connection pooling built-in
- Active PostgreSQL support

### Why TanStack Router?
- Type-safe routing
- Better performance than React Router
- Good developer experience

### Why shadcn/ui?
- Customizable components
- Good accessibility
- Clean design system
- Copy-paste workflow
