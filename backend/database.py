import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Railway injects DATABASE_URL automatically when you add a Postgres plugin.
# Falls back to local dev postgres, then to SQLite for quick local testing.
DATABASE_URL = (
    os.environ.get("DATABASE_URL")
    or "postgresql://postgres:O17112000g@localhost:5432/gridscore"
)

# Railway (and some other hosts) give postgres:// URIs; SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()