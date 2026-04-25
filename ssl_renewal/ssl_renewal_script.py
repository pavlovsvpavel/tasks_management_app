#!/usr/bin/env python3
import subprocess
import datetime
import sys
from pathlib import Path

APP_DIR = Path(__file__).parent.parent
CERTBOT_COMPOSE_FILE = "docker-compose-certbot.yml"
DOCKER_COMPOSE_FILE = "docker-compose-prod.yml"
CONTAINER_NAME = "nginx-tasks-app"
SSL_RENEWAL_DIR = Path(__file__).parent
LOG_FILE = SSL_RENEWAL_DIR / "renewal.log"


def log_message(message, level="INFO"):
    """Helper function to log messages to a file."""
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_entry = f"[{timestamp}] [{level}] {message}\n"

    with open(LOG_FILE, "a") as f:
        f.write(log_entry)


def is_container_running():
    """Check if nginx container is running."""
    try:
        result = subprocess.run(
            ['docker', 'container', 'inspect', '-f', '{{.State.Running}}', CONTAINER_NAME],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip().lower() == 'true'
    except subprocess.CalledProcessError:
        return False


def ssl_renewal():
    """Renewal for Let's Encrypt SSL certificate"""
    try:
        log_message("Starting SSL renewal check...")

        if not is_container_running():
            log_message(f"Container {CONTAINER_NAME} is not running", "ERROR")
            return False

        # Step 1: Run certbot renew command
        renew_command = [
            "docker", "compose",
            "-f", str(APP_DIR / CERTBOT_COMPOSE_FILE),
            "run", "-T", "--rm", "certbot", "renew"
        ]
        result = subprocess.run(renew_command, cwd=APP_DIR, capture_output=True, text=True, check=True)

        # Log output and check if renewal actually happened
        if result.stdout:
            log_message(f"Certbot output: {result.stdout.strip()}")

            # GRACEFUL EXIT: If not due for renewal, we succeed, but skip reloading Nginx
            if "No renewals were attempted" in result.stdout or "not yet due for renewal" in result.stdout.lower():
                log_message("Certificates not yet due for renewal. Skipping Nginx reload.", "INFO")
                return True

        if result.stderr:
            log_message(f"Certbot warnings: {result.stderr.strip()}", "WARNING")

        log_message("SSL renewal completed successfully. Applying new certificates to Nginx...")

        # Step 2: Gracefully reload nginx (Zero Downtime)
        # This replaces the need to force-recreate the whole container.
        reload_command = [
            "docker", "exec", CONTAINER_NAME, "nginx", "-s", "reload"
        ]
        subprocess.run(reload_command, check=True)

        log_message("Nginx configuration reloaded successfully.")
        return True

    except subprocess.CalledProcessError as err:
        log_message(f"Process failed. Error: {err.stderr.strip() if err.stderr else str(err)}", "ERROR")
        return False
    except Exception as err:
        log_message(f"Unexpected error: {str(err)}", "ERROR")
        return False


if __name__ == "__main__":
    try:
        if not ssl_renewal():
            log_message("SSL renewal process completed with errors", "ERROR")
            sys.exit(1)
        # Only log this if it actually completed (either skipping or renewing)
        log_message("SSL renewal process completed successfully\n---")

    except Exception as e:
        log_message(f"Fatal error in main execution: {str(e)}", "CRITICAL")
        sys.exit(1)
