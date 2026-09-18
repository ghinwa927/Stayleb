def generate_otp_template(full_name: str, otp: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your StayLeb password</title>
    </head>

    <body style="
        margin: 0;
        padding: 0;
        background-color: #FFFFFF;
        font-family: Arial, Helvetica, sans-serif;
        color: #1E293B;
    ">

        <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
                background-color: #FFFFFF;
                padding: 40px 16px;
            "
        >
            <tr>
                <td align="center">

                    <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="
                            max-width: 600px;
                            background-color: #FFFFFF;
                            border-radius: 16px;
                            overflow: hidden;
                            border: 1px solid #46B1B1;
                            box-shadow: 0 4px 14px rgba(30, 41, 59, 0.08);
                        "
                    >

                        <!-- HEADER -->
                        <tr>
                            <td
                                align="center"
                                style="
                                    background-color: #FFFFFF;
                                    padding: 28px 32px 20px 32px;
                                    border-bottom: 1px solid #46B1B1;
                                "
                            >
                              <img
    src="cid:stayleb_logo"
    alt="StayLeb"
    width="170"
    style="
        display: block;
        width: 170px;
        max-width: 100%;
        height: auto;
        border: 0;
    "
>
                            </td>
                        </tr>

                        <!-- CONTENT -->
                        <tr>
                            <td style="padding: 40px 40px 34px 40px;">

                                <h1 style="
                                    margin: 0 0 14px 0;
                                    color: #1E293B;
                                    font-size: 26px;
                                    line-height: 34px;
                                    font-weight: 700;
                                    text-align: center;
                                ">
                                    Reset your password
                                </h1>

                                <p style="
                                    margin: 0 0 26px 0;
                                    color: #1E293B;
                                    font-size: 15px;
                                    line-height: 24px;
                                    text-align: center;
                                ">
                                    We received a request to reset your
                                    StayLeb password.
                                </p>

                                <p style="
                                    margin: 0 0 20px 0;
                                    color: #1E293B;
                                    font-size: 16px;
                                    line-height: 24px;
                                ">
                                    Hello <strong>{full_name}</strong>,
                                </p>

                                <p style="
                                    margin: 0 0 28px 0;
                                    color: #1E293B;
                                    font-size: 15px;
                                    line-height: 24px;
                                ">
                                    Enter the verification code below
                                    to continue resetting your password.
                                </p>

                                <!-- OTP -->
                                <table
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0"
                                    border="0"
                                >
                                    <tr>
                                        <td align="center">

                                            <table
                                                cellpadding="0"
                                                cellspacing="0"
                                                border="0"
                                                style="
                                                    background-color: #FFFFFF;
                                                    border: 2px solid #46B1B1;
                                                    border-radius: 12px;
                                                "
                                            >
                                                <tr>
                                                    <td style="padding: 18px 32px;">

                                                        <span style="
                                                            color: #46B1B1;
                                                            font-size: 36px;
                                                            line-height: 44px;
                                                            font-weight: 700;
                                                            letter-spacing: 8px;
                                                        ">
                                                            {otp}
                                                        </span>

                                                    </td>
                                                </tr>
                                            </table>

                                        </td>
                                    </tr>
                                </table>

                                <p style="
                                    margin: 18px 0 30px 0;
                                    color: #1E293B;
                                    font-size: 13px;
                                    line-height: 20px;
                                    text-align: center;
                                ">
                                    This verification code expires in
                                    <strong>10 minutes</strong>.
                                </p>

                                <!-- SECURITY NOTICE -->
                                <table
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0"
                                    border="0"
                                    style="
                                        background-color: #FFFFFF;
                                        border-left: 4px solid #D1A695;
                                        border-radius: 8px;
                                    "
                                >
                                    <tr>
                                        <td style="padding: 16px 18px;">

                                            <p style="
                                                margin: 0;
                                                color: #1E293B;
                                                font-size: 13px;
                                                line-height: 20px;
                                            ">
                                                <strong>
                                                    Didn't request this?
                                                </strong>
                                                <br>
                                                You can safely ignore this email.
                                                Your password will remain unchanged.
                                            </p>

                                        </td>
                                    </tr>
                                </table>

                            </td>
                        </tr>

                        <!-- FOOTER -->
                        <tr>
                            <td style="
                                background-color: #46B1B1;
                                padding: 22px 32px;
                                text-align: center;
                            ">

                                <p style="
                                    margin: 0 0 5px 0;
                                    color: #FFFFFF;
                                    font-size: 15px;
                                    font-weight: 700;
                                ">
                                    StayLeb
                                </p>

                                <p style="
                                    margin: 0;
                                    color: #FFFFFF;
                                    font-size: 12px;
                                    line-height: 18px;
                                ">
                                    Discover stays across Lebanon.
                                </p>

                            </td>
                        </tr>

                    </table>

                    <p style="
                        margin: 20px 0 0 0;
                        color: #1E293B;
                        font-size: 11px;
                        line-height: 17px;
                        text-align: center;
                    ">
                        This is an automated security email from StayLeb.
                        Please do not reply.
                    </p>

                </td>
            </tr>
        </table>

    </body>
    </html>
    """