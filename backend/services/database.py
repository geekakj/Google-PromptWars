import sqlite3
import os
import threading
from typing import List, Dict, Any

DB_PATH = os.getenv("DATABASE_URL", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "voting.db"))
db_lock = threading.Lock()

def get_connection():
    """Returns a sqlite3 connection with standard settings."""
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    with db_lock:
        conn = get_connection()
        try:
            c = conn.cursor()
            c.execute('''CREATE TABLE IF NOT EXISTS voters
                         (voter_hash TEXT PRIMARY KEY, has_voted BOOLEAN)''')
            c.execute('''CREATE TABLE IF NOT EXISTS votes
                         (id INTEGER PRIMARY KEY AUTOINCREMENT, candidate_id TEXT)''')
            conn.commit()
        finally:
            conn.close()

def has_voted(voter_hash: str) -> bool:
    with db_lock:
        conn = get_connection()
        try:
            c = conn.cursor()
            c.execute("SELECT has_voted FROM voters WHERE voter_hash=?", (voter_hash,))
            row = c.fetchone()
            if row:
                return bool(row["has_voted"])
            return False
        finally:
            conn.close()

def record_vote(voter_hash: str, candidate_id: str) -> None:
    with db_lock:
        conn = get_connection()
        try:
            c = conn.cursor()
            c.execute("INSERT INTO votes (candidate_id) VALUES (?)", (candidate_id,))
            c.execute("INSERT OR REPLACE INTO voters (voter_hash, has_voted) VALUES (?, ?)", (voter_hash, 1))
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

def get_results() -> List[Dict[str, Any]]:
    with db_lock:
        conn = get_connection()
        try:
            c = conn.cursor()
            c.execute("SELECT candidate_id, COUNT(*) as vote_count FROM votes GROUP BY candidate_id")
            rows = c.fetchall()
            return [{"candidate_id": row["candidate_id"], "votes": row["vote_count"]} for row in rows]
        finally:
            conn.close()
