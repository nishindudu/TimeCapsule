import datetime
import os
import sqlite3

import libsql
from flask import Flask, jsonify, render_template, request

app = Flask(__name__, template_folder="frontend/templates", static_folder="frontend/static")

DATABASE_URL = os.getenv("DATABASE_URL")
TOKEN = os.getenv("TOKEN")
LOCAL_DB_PATH = os.getenv(
    "LOCAL_DB_PATH", os.path.join(app.root_path, "scores.db")
)


def get_connection():
    if DATABASE_URL:
        return libsql.connect(database=DATABASE_URL, auth_token=TOKEN)
    return sqlite3.connect(LOCAL_DB_PATH)


def initialize_database():
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                program_name TEXT NOT NULL UNIQUE,
                score INTEGER NOT NULL DEFAULT 0,
                updated_at TEXT NOT NULL
            )
            """
        )

        now = datetime.datetime.utcnow().isoformat(timespec="seconds")
        default_programs = [
            ("CSE", 0, now),
            ("IT", 0, now),
            ("MECH", 0, now),
            ("ECE & RAI", 0, now),
            ("EEE", 0, now),
        ]
        conn.executemany(
            "INSERT OR IGNORE INTO scores (program_name, score, updated_at) VALUES (?, ?, ?)",
            default_programs,
        )
        conn.commit()


def fetch_scores():
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT id, program_name, score, updated_at
            FROM scores
            ORDER BY CASE program_name
                WHEN 'CSE' THEN 1
                WHEN 'IT' THEN 2
                WHEN 'MECH' THEN 3
                WHEN 'ECE & RAI' THEN 4
                WHEN 'EEE' THEN 5
                ELSE 6
            END, program_name
            """
        ).fetchall()

    scores = []
    for row in rows:
        scores.append(
            {
                "id": row[0],
                "program_name": row[1],
                "score": row[2],
                "updated_at": row[3],
            }
        )
    return scores


@app.route("/")
def scoreboard():
    return render_template("index.html", scores=fetch_scores())


@app.route("/admin")
def admin_panel():
    return render_template("admin.html", scores=fetch_scores())


@app.route("/api/scores", methods=["GET"])
def get_scores():
    return jsonify({"scores": fetch_scores()})


@app.route("/api/scores/<int:score_id>", methods=["PUT"])
def update_score(score_id):
    payload = request.get_json(silent=True) or {}
    program_name = str(payload.get("program_name", "")).strip()
    score = payload.get("score")

    if not program_name:
        return jsonify({"message": "Programme name is required."}), 400

    try:
        score = int(score)
    except (TypeError, ValueError):
        return jsonify({"message": "Score must be a valid number."}), 400

    if score < 0:
        return jsonify({"message": "Score cannot be negative."}), 400

    updated_at = datetime.datetime.utcnow().isoformat(timespec="seconds")

    try:
        with get_connection() as conn:
            result = conn.execute(
                """
                UPDATE scores
                SET program_name = ?, score = ?, updated_at = ?
                WHERE id = ?
                """,
                (program_name, score, updated_at, score_id),
            )
            conn.commit()
            if result.rowcount == 0:
                return jsonify({"message": "Score entry not found."}), 404
    except Exception as exc:
        error_text = str(exc).lower()
        if "unique" in error_text:
            return jsonify({"message": "Programme name already exists."}), 409
        return jsonify({"message": "Failed to update score entry."}), 500

    return jsonify({"message": "Score updated successfully."})


initialize_database()


if __name__ == "__main__":
    app.run(debug=True)
