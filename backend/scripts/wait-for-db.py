import time
import psycopg

from core.config import settings

TIMEOUT_SECONDS = 120


def wait_for_db():
    """
    Waits for the PostgreSQL database to be available.
    """
    start_time = time.time()
    sqlalchemy_url = settings.DATABASE_URL
    if not sqlalchemy_url:
        raise ValueError("DATABASE_URL environment variable not set.")

    db_conn_str = sqlalchemy_url.replace("+psycopg", "")

    print("Waiting for database to be ready...")

    while time.time() - start_time < TIMEOUT_SECONDS:
        try:
            # Try to connect to the database
            with psycopg.connect(db_conn_str, connect_timeout=5) as conn:
                # If connection succeeds, the database is ready
                print("Database is ready!")
                return
        except psycopg.OperationalError as e:
            # If connection fails, print a message and wait
            print(f"Database not ready yet, retrying in 5 seconds... (Error: {e})")
            time.sleep(5)

    # If the loop finishes without connecting, raise an exception
    raise TimeoutError(f"Database did not become available within {TIMEOUT_SECONDS} seconds.")


if __name__ == "__main__":
    wait_for_db()
