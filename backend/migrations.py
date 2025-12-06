"""
Auto-migrations module for database schema updates.
Handles automatic column additions and schema modifications.
"""

from sqlalchemy import text, inspect
from database import engine


def run_migrations():
    """
    Execute automatic migrations to add missing columns.
    This allows existing tables to be updated without losing data.
    """
    with engine.connect() as conn:
        inspector = inspect(engine)

        # Check if questions table exists before trying to migrate
        if 'questions' not in inspector.get_table_names():
            print("[Migration] Waiting for tables to be created...")
            return

        # Check if answer_type column exists in questions table
        columns = [col['name'] for col in inspector.get_columns('questions')]

        if 'answer_type' not in columns:
            print("[Migration] Adding 'answer_type' column to 'questions' table...")
            conn.execute(text(
                "ALTER TABLE questions ADD COLUMN answer_type VARCHAR DEFAULT 'options'"
            ))
            conn.commit()
            print("[Migration] Column 'answer_type' added successfully")
        else:
            print("[Migration] Database schema is up to date")


def init_migrations():
    """
    Initialize and run all migrations.
    Called from main.py at startup.
    """
    try:
        run_migrations()
    except Exception as e:
        print(f"[Migration] Warning: {e}")
