#!/usr/bin/env python3
import subprocess
import datetime
import sys
from pathlib import Path

# Project paths
APP_DIR = Path(__file__).parent.parent
CERTBOT_DIR = APP_DIR / "certbot"
CONF_DIR = CERTBOT_DIR / "conf"
LOGS_DIR = CERTBOT_DIR / "logs"
CREDS_FILE = CERTBOT_DIR / "cloudflare.ini"

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
    """Renewal for Let's Encrypt SSL certificate via Cloudflare DNS plugin."""
    try:
        log_message("Starting SSL renewal check...")

        if not is_container_running():
            log_message(f"Container {CONTAINER_NAME} is not running", "ERROR")
            return False

        if not CREDS_FILE.exists():
            log_message(f"Cloudflare credentials file missing at {CREDS_FILE}", "ERROR")
            return False

        # Step 1: Run certbot renew using certbot/dns-cloudflare container
        renew_command = [
            "docker", "run", "--rm",
            "-v", f"{CONF_DIR}:/etc/letsencrypt",
            "-v", f"{LOGS_DIR}:/var/log/letsencrypt",
            "-v", f"{CREDS_FILE}:/etc/letsencrypt/cloudflare.ini:ro",
            "certbot/dns-cloudflare", "renew"
        ]

        result = subprocess.run(
            renew_command,
            cwd=APP_DIR,
            capture_output=True,
            text=True,
            check=True
        )

        output = f"{result.stdout}\n{result.stderr}".strip()
        if output:
            log_message(f"Certbot output:\n{output}")

            # GRACEFUL EXIT: If not due for renewal, skip reloading Nginx
            if "No renewals were attempted" in output or "not yet due for renewal" in output.lower():
                log_message("Certificates not yet due for renewal. Skipping Nginx reload.", "INFO")
                return True

        log_message("SSL renewal completed successfully. Reloading Nginx...")

        # Step 2: Gracefully reload Nginx (Zero Downtime)
        reload_command = [
            "docker", "exec", CONTAINER_NAME, "nginx", "-s", "reload"
        ]
        subprocess.run(reload_command, check=True)

        log_message("Nginx configuration reloaded successfully.")
        return True

    except subprocess.CalledProcessError as err:
        err_out = err.stderr.strip() if err.stderr else str(err)
        log_message(f"Process failed. Error: {err_out}", "ERROR")
        return False
    except Exception as err:
        log_message(f"Unexpected error: {str(err)}", "ERROR")
        return False


if __name__ == "__main__":
    try:
        if not ssl_renewal():
            log_message("SSL renewal process completed with errors", "ERROR")
            sys.exit(1)

        log_message("SSL renewal process completed successfully\n---")

    except Exception as e:
        log_message(f"Fatal error in main execution: {str(e)}", "CRITICAL")
        sys.exit(1)