import { mailTransporter } from '../config/mailConfig.js';

export async function sendRegisterEmail(toEmail, subject, html) {
  const mailOptions = {
    from: {
      name: 'FastFood App',
      address: process.env.SMTP_USER
    },
    to: toEmail, // <-- dynamic: email người đăng ký
    subject,
    html
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw error;
  }
}