import os
import smtplib
import logging

from pathlib import Path
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage


BASE_DIR = Path(__file__).resolve().parent.parent

LOGO_PATH = BASE_DIR / "assets" / "stayleb_logo.jpg"

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, html_content: str):
    email_host = os.getenv("EMAIL_HOST")
    email_port = int(os.getenv("EMAIL_PORT", "465"))
    email_user = os.getenv("EMAIL_USER")
    email_pass = os.getenv("EMAIL_PASS")

    if not all([email_host, email_user, email_pass]):
        logger.warning("Email configuration missing (EMAIL_HOST, EMAIL_USER, EMAIL_PASS). Skipping email send.")
        return

    # Outer container for HTML + inline images
    message = MIMEMultipart("related")

    message["From"] = f"StayLeb <{email_user}>"
    message["To"] = to
    message["Subject"] = subject

    # HTML/text container
    alternative = MIMEMultipart("alternative")
    message.attach(alternative)

    html_part = MIMEText(
        html_content,
        "html",
        "utf-8"
    )
    alternative.attach(html_part)

    # Attach StayLeb logo as an inline image (optional - skip if file missing)
    try:
        with open(LOGO_PATH, "rb") as image_file:
            logo = MIMEImage(
                image_file.read(),
                _subtype="png"
            )

            logo.add_header(
                "Content-ID",
                "<stayleb_logo>"
            )

            logo.add_header(
                "Content-Disposition",
                "inline",
                filename="stayleb_logo.png"
            )

            message.attach(logo)
    except FileNotFoundError:
        logger.warning(f"Logo file not found at {LOGO_PATH}. Sending email without logo.")
    except Exception as e:
        logger.warning(f"Failed to attach logo: {e}. Sending email without logo.")

    try:
        with smtplib.SMTP_SSL(email_host, email_port) as server:
            server.login(email_user, email_pass)

            server.sendmail(
                email_user,
                to,
                message.as_string()
            )
            logger.info(f"Email sent successfully to {to}")
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        raise