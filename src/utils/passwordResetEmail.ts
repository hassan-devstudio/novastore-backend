const passwordResetEmail = (firstName: string, otp: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset - NovaStore</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f4f7fb;
  font-family: Arial, Helvetica, sans-serif;
">

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background-color: #f4f7fb; padding: 40px 15px;"
  >
    <tr>
      <td align="center">

        <!-- Main Card -->
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width: 560px;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 30px rgba(0,0,0,0.08);
          "
        >

          <!-- Header -->
          <tr>
            <td
              align="center"
              style="
                background-color: #111827;
                padding: 30px 20px;
              "
            >
              <div style="
                font-size: 28px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: -0.5px;
              ">
                NovaStore
              </div>

              <div style="
                margin-top: 8px;
                font-size: 14px;
                color: #cbd5e1;
              ">
                Secure account verification
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 35px;">

              <h1 style="
                margin: 0 0 15px;
                font-size: 24px;
                line-height: 32px;
                color: #111827;
              ">
                Reset your password
              </h1>

              <p style="
                margin: 0 0 25px;
                font-size: 15px;
                line-height: 24px;
                color: #64748b;
              ">
                Hi ${firstName}, we received a request to reset the
                password for your NovaStore account.
              </p>

              <p style="
                margin: 0 0 12px;
                font-size: 14px;
                font-weight: 600;
                color: #334155;
              ">
                Your verification code
              </p>

              <!-- OTP -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>
                  <td
                    align="center"
                    style="
                      background-color: #f8fafc;
                      border: 2px dashed #cbd5e1;
                      border-radius: 12px;
                      padding: 22px 10px;
                    "
                  >
                    <div style="
                      font-size: 36px;
                      font-weight: 700;
                      letter-spacing: 8px;
                      color: #111827;
                    ">
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Copy button - visual only inside email -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin-top: 18px;"
              >
                <tr>
                  <td align="center">

                    <span style="
                      display: inline-block;
                      padding: 12px 24px;
                      background-color: #111827;
                      color: #ffffff;
                      border-radius: 8px;
                      font-size: 14px;
                      font-weight: 600;
                    ">
                      📋 Copy OTP
                    </span>

                  </td>
                </tr>
              </table>

              <p style="
                margin: 25px 0 0;
                padding: 14px 16px;
                background-color: #fff7ed;
                border-radius: 8px;
                font-size: 13px;
                line-height: 20px;
                color: #9a3412;
              ">
                ⏱️ This verification code will expire in
                <strong>10 minutes</strong>.
              </p>

              <p style="
                margin: 25px 0 0;
                font-size: 14px;
                line-height: 22px;
                color: #64748b;
              ">
                If you didn't request a password reset, you can safely
                ignore this email. Your account remains secure.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                background-color: #f8fafc;
                padding: 25px 20px;
                border-top: 1px solid #e2e8f0;
              "
            >
              <p style="
                margin: 0;
                font-size: 12px;
                color: #94a3b8;
              ">
                © 2026 NovaStore. All rights reserved.
              </p>

              <p style="
                margin: 8px 0 0;
                font-size: 12px;
                color: #94a3b8;
              ">
                This is an automated email. Please do not reply.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
};

export default passwordResetEmail;
