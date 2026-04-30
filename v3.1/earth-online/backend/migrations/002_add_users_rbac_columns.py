"""Check and add missing columns to the users table."""
import psycopg2
import sys

DB_URL = 'postgresql://earthonline:earthonline2026@localhost:5432/earthonline'

def column_exists(cur, table, column):
    cur.execute("""
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = %s AND column_name = %s
        )
    """, (table, column))
    return cur.fetchone()[0]

def add_column(cur, table, column, definition):
    cur.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")
    print(f"  Added column: {table}.{column}")

def main():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    print("Checking users table schema...")
    
    missing_columns = [
        ('role_id', 'INTEGER REFERENCES admin_roles(id)'),
        ('last_login_at', 'TIMESTAMP WITH TIME ZONE'),
        ('login_ip', 'VARCHAR(50)'),
        ('password_changed_at', 'TIMESTAMP WITH TIME ZONE'),
        ('is_locked', 'BOOLEAN DEFAULT FALSE'),
        ('lock_reason', 'VARCHAR(200)'),
    ]
    
    added = 0
    for col_name, col_def in missing_columns:
        if not column_exists(cur, 'users', col_name):
            add_column(cur, 'users', col_name, col_def)
            added += 1
        else:
            print(f"  Column already exists: users.{col_name}")
    
    # Check and create foreign key index for role_id
    if column_exists(cur, 'users', 'role_id'):
        cur.execute("""
            SELECT EXISTS (
                SELECT 1 FROM pg_indexes
                WHERE tablename = 'users' AND indexname = 'ix_users_role_id'
            )
        """)
        if not cur.fetchone()[0]:
            cur.execute("CREATE INDEX ix_users_role_id ON users(role_id)")
            print("  Created index: ix_users_role_id")
    
    if added > 0:
        conn.commit()
        print(f"\nMigration complete: {added} column(s) added to users table.")
    else:
        print("\nNo migrations needed. Schema is up to date.")
    
    cur.close()
    conn.close()
    return 0

if __name__ == '__main__':
    sys.exit(main())
