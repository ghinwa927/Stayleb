import os
import smtplib

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def send_email(to: str, subject: str, html_content: str):
    email_host = os.getenv("EMAIL_HOST")
    email_port = int(os.getenv("EMAIL_PORT", "465"))
    email_user = os.getenv("EMAIL_USER")
    email_pass = os.getenv("EMAIL_PASS")

    message = MIMEMultipart("alternative")

    message["From"] = f"StayLeb <{email_user}>"
    message["To"] = to
    message["Subject"] = subject

    html_part = MIMEText(html_content, "html")
    message.attach(html_part)

    with smtplib.SMTP_SSL(email_host, email_port) as server:
        server.login(email_user, email_pass)
        server.sendmail(
            email_user,
            to,
            message.as_string()
        )