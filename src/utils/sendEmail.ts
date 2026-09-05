import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

if (!emailUser || !emailPassword) {
  throw new Error("EMAIL_USER and EMAIL_PASSWORD must be defined in .env");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
});

const sendEmail = async (
  email: string,
  subject: string,
  html: string,
): Promise<void> => {
  await transporter.sendMail({
    from: emailUser,
    to: email,
    subject,
    html,
  });
};

export default sendEmail;
