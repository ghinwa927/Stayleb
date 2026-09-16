def generate_otp_template(full_name: str, otp: str) -> str:
    return f"""
    <html>
        <body>
            <h2>Reset your StayLeb password</h2>

            <p>Hello {full_name},</p>

            <p>
                We received a request to reset your password.
                Use the code below:
            </p>

            <h1>{otp}</h1>

            <p>This code expires in 10 minutes.</p>

            <p>
                If you did not request this password reset,
                you can ignore this email.
            </p>

            <p>StayLeb</p>
        </body>
    </html>
    """