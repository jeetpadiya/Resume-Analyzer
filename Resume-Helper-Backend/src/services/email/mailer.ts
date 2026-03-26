import nodemailer from "nodemailer";

const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be configured");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

export const sendPasswordResetEmail = async (to: string, resetUrl: string) => {
  const emailUser = process.env.EMAIL_USER;
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || emailUser;

  await transporter.sendMail({
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
  });
};
