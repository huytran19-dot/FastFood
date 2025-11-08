const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key from environment
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (to, token) => {
  const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
  
  const msg = {
    to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@fastfood.vn',
      name: 'FastFood Team'
    },
    replyTo: process.env.SENDGRID_FROM_EMAIL || 'noreply@fastfood.vn',
    subject: 'Xác nhận đăng ký tài khoản FastFood',
    text: `Xin chào,\n\nCảm ơn bạn đã đăng ký tài khoản tại FastFood.\n\nVui lòng xác thực email của bạn bằng cách truy cập link sau:\n${verificationUrl}\n\nLink này sẽ hết hạn sau 24 giờ.\n\nNếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.\n\nTrân trọng,\nĐội ngũ FastFood`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 30px; text-align: center; background-color: #ff6b35; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-family: Arial, sans-serif;">FastFood</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 20px; font-family: Arial, sans-serif;">Xin chào!</h2>
                    
                    <p style="margin: 0 0 15px 0; color: #555555; font-size: 16px; line-height: 1.6; font-family: Arial, sans-serif;">
                      Cảm ơn bạn đã đăng ký tài khoản tại <strong>FastFood</strong>.
                    </p>
                    
                    <p style="margin: 0 0 25px 0; color: #555555; font-size: 16px; line-height: 1.6; font-family: Arial, sans-serif;">
                      Để hoàn tất quá trình đăng ký, vui lòng xác thực địa chỉ email của bạn bằng cách nhấn vào nút bên dưới:
                    </p>
                    
                    <!-- Button -->
                    <table role="presentation" style="margin: 30px 0; width: 100%;">
                      <tr>
                        <td align="center">
                          <a href="${verificationUrl}" style="display: inline-block; padding: 14px 40px; background-color: #ff6b35; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; font-family: Arial, sans-serif;">
                            Xác thực Email
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 25px 0 15px 0; color: #777777; font-size: 14px; line-height: 1.6; font-family: Arial, sans-serif;">
                      Hoặc copy và dán link sau vào trình duyệt của bạn:
                    </p>
                    
                    <p style="margin: 0 0 20px 0; padding: 12px; background-color: #f8f8f8; border-radius: 4px; word-break: break-all;">
                      <a href="${verificationUrl}" style="color: #ff6b35; text-decoration: none; font-size: 14px; font-family: monospace;">${verificationUrl}</a>
                    </p>
                    
                    <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6; font-family: Arial, sans-serif;">
                      <strong>Lưu ý:</strong> Link này sẽ hết hạn sau 24 giờ.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px; line-height: 1.6; font-family: Arial, sans-serif; text-align: center;">
                      Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.
                    </p>
                    <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6; font-family: Arial, sans-serif; text-align: center;">
                      © 2025 FastFood. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    // Anti-spam settings
    trackingSettings: {
      clickTracking: { enable: false },
      openTracking: { enable: false }
    },
    // Email categories for tracking
    categories: ['email-verification', 'user-onboarding']
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error.message);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
};
