import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Common email styling for comic book theme
const getEmailTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NovaMart</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="background: white; border-radius: 12px 12px 0 0; padding: 30px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="display: inline-block; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); padding: 12px 24px; border-radius: 25px; margin-bottom: 15px;">
                <h1 style="margin: 0; color: white; font-size: 24px; font-weight: bold; letter-spacing: 1px;">📚 OTAKU SENSEI</h1>
            </div>
            <p style="margin: 0; color: #666; font-size: 14px;">Your Gateway to Amazing Comics</p>
        </div>
        
        <!-- Content -->
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            ${content}
            
            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #f0f0f0; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #888; font-size: 12px;">
                    This email was sent by NovaMart. If you have any questions, contact our support team.
                </p>
                <div style="margin-top: 15px;">
                    <span style="display: inline-block; margin: 0 5px; color: #ff6b6b; font-size: 16px;">📖</span>
                    <span style="display: inline-block; margin: 0 5px; color: #4ecdc4; font-size: 16px;">⚡</span>
                    <span style="display: inline-block; margin: 0 5px; color: #45b7d1; font-size: 16px;">🎨</span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;

// Function to send OTP email for signup
const sendOtpEmail = async (email, otp) => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: linear-gradient(45deg, #ff6b6b, #ffa500); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <span style="font-size: 36px;">🔐</span>
        </div>
        <h2 style="margin: 0; color: #333; font-size: 28px; font-weight: 600;">Welcome to the Comic Universe!</h2>
    </div>
    
    <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
        Hey there, future comic enthusiast! 👋 We're excited to have you join our community of manga and comic lovers.
    </p>
    
    <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
        To complete your registration, please use this verification code:
    </p>
    
    <div style="background: linear-gradient(45deg, #667eea, #764ba2); border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);">
        <p style="margin: 0 0 10px 0; color: white; font-size: 14px; font-weight: 500; letter-spacing: 1px;">YOUR VERIFICATION CODE</p>
        <div style="color: white; font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 10px 0;">${otp}</div>
        <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.8); font-size: 12px;">Expires in 5 minutes</p>
    </div>
    
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 25px 0;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>⚠️ Security Note:</strong> If you didn't request this signup, please ignore this email.
        </p>
    </div>
    
    <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
        Ready to dive into amazing stories? Let's get started! 🚀
    </p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🎨 Your NovaMart Verification Code",
    html: getEmailTemplate(content),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

// Function to send password reset email with token link
const sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `${
    process.env.FRONTEND_BASE_URL || "http://localhost:5173"
  }/reset-password/${token}`;

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: linear-gradient(45deg, #4ecdc4, #44a08d); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <span style="font-size: 36px;">🔑</span>
        </div>
        <h2 style="margin: 0; color: #333; font-size: 28px; font-weight: 600;">Password Reset Request</h2>
    </div>
    
    <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
        No worries! We all forget passwords sometimes. 😅 Let's get you back to reading those amazing comics!
    </p>
    
    <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
        Click the button below to create a new password for your account:
    </p>
    
    <div style="text-align: center; margin: 35px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(45deg, #ff6b6b, #ff8e8e); color: white; padding: 15px 35px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 6px 20px rgba(255, 107, 107, 0.3); transition: all 0.3s ease;">
            🔐 Reset My Password
        </a>
    </div>
    
    <div style="background: #e8f4f8; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px; margin: 25px 0;">
        <p style="margin: 0; color: #0c5460; font-size: 14px;">
            <strong>⏰ Quick Reminder:</strong> This reset link will expire in 15 minutes for your security.
        </p>
    </div>
    
    <p style="color: #666; font-size: 14px; line-height: 1.5; margin-top: 25px;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <span style="color: #4ecdc4; word-break: break-all;">${resetUrl}</span>
    </p>
    
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 25px 0;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>⚠️ Security Note:</strong> If you didn't request this password reset, please ignore this email.
        </p>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🔑 Reset Your NovaMart Password",
    html: getEmailTemplate(content),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

// Function to send subscription confirmation email
const sendOrderConfirmationEmail = async (
  email,
  planType,
  startDate,
  endDate
) => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: linear-gradient(45deg, #ffd700, #ffed4e); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <span style="font-size: 36px;">👑</span>
        </div>
        <h2 style="margin: 0; color: #333; font-size: 28px; font-weight: 600;">Welcome to Premium!</h2>
    </div>
    
    <div style="background: linear-gradient(45deg, #667eea, #764ba2); border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0; color: white;">
        <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">🎉 Congratulations!</p>
        <p style="margin: 0; font-size: 16px; opacity: 0.9;">You've unlocked the full comic experience with your <strong>${planType}</strong> subscription!</p>
    </div>
    
    <div style="background: #f8f9ff; border-radius: 10px; padding: 25px; margin: 25px 0; border-left: 4px solid #667eea;">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; font-weight: 600;">📅 Your Subscription Details</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #666; font-weight: 500;">Start Date:</span>
            <span style="color: #333; font-weight: 600;">${
              startDate.toISOString().split("T")[0]
            }</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
            <span style="color: #666; font-weight: 500;">End Date:</span>
            <span style="color: #333; font-weight: 600;">${
              endDate.toISOString().split("T")[0]
            }</span>
        </div>
    </div>
    
    <div style="background: linear-gradient(45deg, #4ecdc4, #44a08d); border-radius: 10px; padding: 20px; margin: 25px 0; color: white; text-align: center;">
        <h3 style="margin: 0 0 10px 0; font-size: 18px;">🚀 What You've Unlocked</h3>
        <p style="margin: 5px 0; opacity: 0.9;">✨ Unlimited access to premium comics</p>
        <p style="margin: 5px 0; opacity: 0.9;">📱 Ad-free reading experience</p>
        <p style="margin: 5px 0; opacity: 0.9;">⚡ Early access to new releases</p>
        <p style="margin: 5px 0; opacity: 0.9;">💎 Exclusive premium content</p>
    </div>
    
    <p style="color: #555; font-size: 16px; line-height: 1.6; text-align: center; margin-top: 30px;">
        Time to dive into your favorite stories! Happy reading! 📚✨
    </p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "👑 Welcome to NovaMart Premium!",
    html: getEmailTemplate(content),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Subscription confirmation email sent to ${email}`);
  } catch (error) {
    console.error("Error sending subscription confirmation email:", error);
    throw new Error("Failed to send subscription confirmation email");
  }
};

export { sendOtpEmail, sendResetPasswordEmail, sendOrderConfirmationEmail };
