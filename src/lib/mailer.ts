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
export async function sendOtpEmail(email: string, otp: string, minutes: number) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "QVerify - Таны баталгаажуулах код (OTP)",
      html: `
        <div style="font-family: Arial, sans-serif">
          <h3>Нэвтрэх баталгаажуулалт</h3>
          <p>Таны нэг удаагийн код:</p>
          <div style="
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 4px;
            margin: 12px 0;
          ">
            ${otp}
          </div>
          <p>Энэ код <b>${minutes} минут</b> хүчинтэй.</p>
          <p style="color:#666;font-size:12px">
            Хэрэв та энэ хүсэлтийг гаргаагүй бол лавлах утсаар холбогдоно уу. Утас: 7777-8888
          </p>
        </div>
      `,
    });
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Failed to send OTP email");
  }
}
