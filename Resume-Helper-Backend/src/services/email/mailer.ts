const getResendConfig = () => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY must be configured");
  }

  if (!from) {
    throw new Error("EMAIL_FROM must be configured");
  }

  return { apiKey, from };
};

export const sendPasswordResetEmail = async (to: string, resetUrl: string) => {
  const { apiKey, from } = getResendConfig();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "resume-helper-backend",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Reset your Resume Helper password",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin-bottom: 12px;">Password reset request</h2>
          <p>We received a request to reset your Resume Helper password.</p>
          <p>This link will expire in 15 minutes.</p>
          <p style="margin: 24px 0;">
            <a
              href="${resetUrl}"
              style="display: inline-block; padding: 12px 18px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 8px;"
            >
              Reset password
            </a>
          </p>
          <p>If you did not request this, you can safely ignore this email.</p>
          <p style="font-size: 12px; color: #6b7280;">If the button does not work, copy and paste this URL into your browser: ${resetUrl}</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend error: ${response.status} ${errorText}`);
  }
};
