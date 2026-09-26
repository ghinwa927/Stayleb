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
    background-color: #F3F9F9;
    font-family: Arial, Helvetica, sans-serif;
    color: #1E293B;
">

    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="
            width: 100%;
            background-color: #F3F9F9;
            padding: 48px 16px;
        "
    >
        <tr>
            <td align="center">

                <!-- MAIN EMAIL CARD -->
                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        width: 100%;
                        max-width: 600px;
                        background-color: #FFFFFF;
                        border-radius: 18px;
                        overflow: hidden;
                        border: 1px solid #CDE7E7;
                        box-shadow:
                            0 8px 18px rgba(58, 154, 158, 0.14),
                            0 18px 45px rgba(58, 154, 158, 0.18);
                    "
                >

                    <!-- TOP ACCENT -->
                    <tr>
                        <td
                            style="
                                height: 6px;
                                background-color: #3A9A9E;
                                font-size: 0;
                                line-height: 0;
                            "
                        >
                            &nbsp;
                        </td>
                    </tr>

                    <!-- HEADER -->
                    <tr>
                        <td
                            align="center"
                            style="
                                background-color: #FFFFFF;
                                padding: 30px 32px 24px 32px;
                                border-bottom: 1px solid #DDEEEE;
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
                                    outline: none;
                                    text-decoration: none;
                                "
                            >

                        </td>
                    </tr>

                    <!-- CONTENT -->
                    <tr>
                        <td style="
                            padding: 42px 42px 38px 42px;
                            background-color: #FFFFFF;
                        ">

                            <!-- TITLE -->
                            <h1 style="
                                margin: 0 0 12px 0;
                                color: #1E293B;
                                font-size: 28px;
                                line-height: 36px;
                                font-weight: 700;
                                text-align: center;
                            ">
                                Reset your password
                            </h1>

                            <!-- GOLD PINK ACCENT -->
                            <table
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                align="center"
                                style="
                                    margin: 0 auto 24px auto;
                                "
                            >
                                <tr>
                                    <td
                                        style="
                                            width: 52px;
                                            height: 4px;
                                            background-color: #D1A695;
                                            border-radius: 10px;
                                            font-size: 0;
                                            line-height: 0;
                                        "
                                    >
                                        &nbsp;
                                    </td>
                                </tr>
                            </table>

                            <!-- DESCRIPTION -->
                            <p style="
                                margin: 0 0 30px 0;
                                color: #64748B;
                                font-size: 15px;
                                line-height: 24px;
                                text-align: center;
                            ">
                                We received a request to reset your StayLeb password.
                            </p>

                            <!-- GREETING -->
                            <p style="
                                margin: 0 0 18px 0;
                                color: #1E293B;
                                font-size: 16px;
                                line-height: 24px;
                            ">
                                Hello
                                <strong style="color: #3A9A9E;">
                                    {full_name}
                                </strong>,
                            </p>

                            <p style="
                                margin: 0 0 30px 0;
                                color: #475569;
                                font-size: 15px;
                                line-height: 24px;
                            ">
                                Enter the verification code below to continue
                                resetting your password.
                            </p>

                            <!-- OTP CONTAINER -->
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
                                                background-color: #F2FAFA;
                                                border: 2px solid #3A9A9E;
                                                border-radius: 16px;
                                                box-shadow:
                                                    0 5px 12px rgba(58, 154, 158, 0.12),
                                                    0 10px 24px rgba(58, 154, 158, 0.10);
                                            "
                                        >
                                            <tr>
                                                <td style="
                                                    padding: 22px 38px;
                                                    text-align: center;
                                                ">

                                                    <span style="
                                                        color: #3A9A9E;
                                                        font-size: 38px;
                                                        line-height: 46px;
                                                        font-weight: 700;
                                                        letter-spacing: 9px;
                                                    ">
                                                        {otp}
                                                    </span>

                                                </td>
                                            </tr>
                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <!-- EXPIRY -->
                            <p style="
                                margin: 22px 0 34px 0;
                                color: #64748B;
                                font-size: 13px;
                                line-height: 20px;
                                text-align: center;
                            ">
                                This verification code expires in
                                <strong style="
                                    color: #2F8D8E;
                                ">
                                    10 minutes
                                </strong>.
                            </p>

                            <!-- SECURITY NOTICE -->
                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="
                                    background-color: #FDF8F6;
                                    border-left: 4px solid #D1A695;
                                    border-radius: 10px;
                                    box-shadow: 0 3px 10px rgba(209, 166, 149, 0.10);
                                "
                            >
                                <tr>
                                    <td style="
                                        padding: 18px 20px;
                                    ">

                                        <p style="
                                            margin: 0;
                                            color: #475569;
                                            font-size: 13px;
                                            line-height: 21px;
                                        ">

                                            <strong style="
                                                color: #1E293B;
                                                font-size: 14px;
                                            ">
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
                            background-color: #3A9A9E;
                            padding: 27px 32px;
                            text-align: center;
                        ">

                            <p style="
                                margin: 0 0 6px 0;
                                color: #FFFFFF;
                                font-size: 17px;
                                font-weight: 700;
                            ">
                                StayLeb
                            </p>

                            <p style="
                                margin: 0 0 12px 0;
                                color: #FFFFFF;
                                font-size: 12px;
                                line-height: 18px;
                            ">
                                Discover stays across Lebanon.
                            </p>

                            <!-- FOOTER ACCENT -->
                            <table
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                align="center"
                                style="
                                    margin: 0 auto;
                                "
                            >
                                <tr>
                                    <td
                                        style="
                                            width: 44px;
                                            height: 3px;
                                            background-color: #D1A695;
                                            border-radius: 10px;
                                            font-size: 0;
                                            line-height: 0;
                                        "
                                    >
                                        &nbsp;
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                </table>

                <!-- BOTTOM TEXT -->
                <p style="
                    margin: 22px 0 0 0;
                    color: #64748B;
                    font-size: 11px;
                    line-height: 18px;
                    text-align: center;
                ">
                    This is an automated security email from StayLeb.
                    <br>
                    Please do not reply.
                </p>

            </td>
        </tr>
    </table>

</body>
</html>
"""