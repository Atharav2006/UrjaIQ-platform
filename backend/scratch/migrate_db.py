from sqlalchemy import text
from database import engine

def migrate():
    columns_to_add = [
        ("readings", "user_id", "INTEGER REFERENCES users(id)"),
        ("readings", "city_tier", "VARCHAR"),
        ("readings", "region", "VARCHAR"),
        ("readings", "climate", "VARCHAR"),
        ("readings", "carbon_kg", "FLOAT"),
        ("readings", "green_score", "INTEGER"),
        ("readings", "renewable_potential", "FLOAT"),
        ("users", "city", "VARCHAR"),
        ("users", "society_name", "VARCHAR")
    ]
    
    with engine.connect() as conn:
        for table, col, dtype in columns_to_add:
            try:
                print(f"Adding {col} to {table}...")
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {dtype};"))
                conn.commit()
                print(f"Success: {col} added.")
            except Exception as e:
                conn.rollback()
                if "already exists" in str(e):
                    print(f"Skipped: {col} already exists.")
                else:
                    print(f"Error adding {col}: {e}")

if __name__ == "__main__":
    migrate()
