import sqlite3
import os
from typing import List, Dict, Any

DB_PATH = os.getenv("DATABASE_URL", "voting.db")

def init_db() -> None:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS voters
                 (voter_hash TEXT PRIMARY KEY, has_voted BOOLEAN)''')
    c.execute('''CREATE TABLE IF NOT EXISTS votes
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, candidate_id TEXT)''')
    conn.commit()
    conn.close()

def has_voted(voter_hash: str) -> bool:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT has_voted FROM voters WHERE voter_hash=?", (voter_hash,))
    row = c.fetchone()
    conn.close()
    if row:
        return row[0]
    return False

def record_vote(voter_hash: str, candidate_id: str) -> None:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        c.execute("INSERT INTO votes (candidate_id) VALUES (?)", (candidate_id,))
        c.execute("INSERT OR REPLACE INTO voters (voter_hash, has_voted) VALUES (?, ?)", (voter_hash, 1))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def get_results() -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT candidate_id, COUNT(*) FROM votes GROUP BY candidate_id")
    rows = c.fetchall()
    conn.close()
    return [{"candidate_id": row[0], "votes": row[1]} for row in rows]
