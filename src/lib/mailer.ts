import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // 587 → false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
export async function sendResetEmail(email: string, link: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Reset your password",
      html: `
      <p>Password reset хийх линк:</p>
      <a href="${link}">${link}</a>
      <p>15 минутын дотор ашиглана уу.</p>
    `,
    });
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Failed to send reset email");
  }
}
