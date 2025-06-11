import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Validate environment variables
const requiredEnvVars = ["EMAIL_USER", "EMAIL_PASS"];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);
if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_PORT === "465", 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP transporter verification failed:", error);
  } else {
    console.log("SMTP transporter is ready");
  }
});

// Email template wrapper
const getEmailTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NovaMart</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); min-height: 100vh;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="background: white; border-radius: 16px 16px 0 0; padding: 32px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
            <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 16px 32px; border-radius: 50px; margin-bottom: 16px; box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);">
                <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700; letter-spacing: 1.5px;">🛒 NOVAMART</h1>
            </div>
            <p style="margin: 0; color: #64748b; font-size: 16px; font-weight: 500;">Your Premier Shopping Destination</p>
        </div>
        
        <!-- Content -->
        <div style="background: white; padding: 48px 32px; border-radius: 0 0 16px 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
            ${content}
            
            <!-- Footer -->
            <div style="margin-top: 48px; padding-top: 32px; border-top: 2px solid #f1f5f9; text-align: center;">
                <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px 0; color: #475569; font-size: 14px; font-weight: 600;">
                        Need Help? We're Here for You!
                    </p>
                    <p style="margin: 0; color: #64748b; font-size: 13px;">
                        Contact our support team at <a href="mailto:support@novamart.com" style="color: #667eea; text-decoration: none; font-weight: 500;">support@novamart.com</a>
                    </p>
                </div>
                
                <div style="margin-top: 20px;">
                    <span style="display: inline-block; margin: 0 8px; color: #667eea; font-size: 18px;">🛍️</span>
                    <span style="display: inline-block; margin: 0 8px; color: #06b6d4; font-size: 18px;">⚡</span>
                    <span style="display: inline-block; margin: 0 8px; color: #8b5cf6; font-size: 18px;">🎉</span>
                </div>
                
                <p style="margin: 16px 0 0 0; color: #94a3b8; font-size: 12px;">
                    © 2024 NovaMart. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`;

// Function to send OTP email for signup
const sendOtpEmail = async (email, otp) => {
  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 88px; height: 88px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);">
            <span style="font-size: 40px;">🔐</span>
        </div>
        <h2 style="margin: 0; color: #1e293b; font-size: 32px; font-weight: 700;">Welcome to NovaMart!</h2>
    </div>
    
    <p style="color: #475569; font-size: 18px; line-height: 1.7; margin-bottom: 24px; text-align: center;">
        Thank you for choosing NovaMart! We're excited to have you as part of our shopping community.
    </p>
    
    <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 32px; text-align: center;">
        To complete your account setup, please verify your email address using the code below:
    </p>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 32px; text-align: center; margin: 32px 0; box-shadow: 0 12px 32px rgba(102, 126, 234, 0.25);">
        <p style="margin: 0 0 12px 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Verification Code</p>
        <div style="color: white; font-size: 36px; font-weight: 800; letter-spacing: 6px; margin: 8px 0;">${otp}</div>
        <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">⏰ Valid for 5 minutes</p>
    </div>
    
    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 28px 0;">
        <div style="display: flex; align-items: flex-start;">
            <span style="color: #d97706; font-size: 18px; margin-right: 12px;">⚠️</span>
            <div>
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600; margin-bottom: 4px;">Security Notice</p>
                <p style="margin: 0; color: #b45309; font-size: 13px; line-height: 1.4;">
                    If you didn't create an account with NovaMart, please ignore this email.
                </p>
            </div>
        </div>
    </div>
    
    <p style="color: #64748b; font-size: 15px; text-align: center; margin-top: 32px;">
        Ready to start shopping? Let's explore amazing products together! 🚀
    </p>
  `;

  const mailOptions = {
    from: `"NovaMart" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔐 Welcome to NovaMart - Verify Your Account",
    html: getEmailTemplate(content),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
    return { success: true, message: `OTP email sent to ${email}` };
  } catch (error) {
    console.error(`Error sending OTP email to ${email}:`, error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

// Function to send password reset email with token link
const sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `${
    process.env.FRONTEND_BASE_URL || "http://localhost:5173"
  }/reset-password/${token}`;

  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); width: 88px; height: 88px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);">
            <span style="font-size: 40px;">🔑</span>
        </div>
        <h2 style="margin: 0; color: #1e293b; font-size: 32px; font-weight: 700;">Reset Your Password</h2>
    </div>
    
    <p style="color: #475569; font-size: 18px; line-height: 1.7; margin-bottom: 24px; text-align: center;">
        Don't worry, it happens to the best of us! Let's get you back to shopping in no time.
    </p>
    
    <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 32px; text-align: center;">
        Click the secure button below to create a new password for your NovaMart account:
    </p>
    
    <div style="text-align: center; margin: 40px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 8px 24px rgba(220, 38, 38, 0.3); transition: all 0.3s ease;">
            🔐 Reset Password
        </a>
    </div>
    
    <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 12px; padding: 20px; margin: 28px 0;">
        <div style="display: flex; align-items: flex-start;">
            <span style="color: #1d4ed8; font-size: 18px; margin-right: 12px;">⏰</span>
            <div>
                <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: 600; margin-bottom: 4px;">Quick Reminder</p>
                <p style="margin: 0; color: #1e3a8a; font-size: 13px; line-height: 1.4;">
                    This password reset link expires in 15 minutes for your security.
                </p>
            </div>
        </div>
    </div>
    
    <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 28px 0; border-left: 4px solid #667eea;">
        <p style="margin: 0 0 8px 0; color: #475569; font-size: 14px; font-weight: 600;">Alternative Access</p>
        <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;">
            If the button doesn't work, copy and paste this link:<br>
            <span style="color: #667eea; word-break: break-all; font-family: 'Courier New', monospace; font-size: 12px;">${resetUrl}</span>
        </p>
    </div>
    
    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 28px 0;">
        <div style="display: flex; align-items: flex-start;">
            <span style="color: #d97706; font-size: 18px; margin-right: 12px;">⚠️</span>
            <div>
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600; margin-bottom: 4px;">Security Notice</p>
                <p style="margin: 0; color: #b45309; font-size: 13px; line-height: 1.4;">
                    If you didn't request this password reset, please ignore this email and your password will remain unchanged.
                </p>
            </div>
        </div>
    </div>
  `;

  const mailOptions = {
    from: `"NovaMart" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔑 Reset Your NovaMart Password",
    html: getEmailTemplate(content),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return { success: true, message: `Password reset email sent to ${email}` };
  } catch (error) {
    console.error(`Error sending password reset email to ${email}:`, error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

// Function to send order confirmation email
const sendOrderConfirmationEmail = async (
  email,
  orderId,
  orderDate,
  totalAmount
) => {
  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 88px; height: 88px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);">
            <span style="font-size: 40px;">✅</span>
        </div>
        <h2 style="margin: 0; color: #1e293b; font-size: 32px; font-weight: 700;">Order Confirmed!</h2>
    </div>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 32px; text-align: center; margin: 32px 0; color: white;">
        <p style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">🎉 Thank You for Your Purchase!</p>
        <p style="margin: 0; font-size: 16px; opacity: 0.9; line-height: 1.6;">Your order has been successfully placed and is being processed by our team.</p>
    </div>
    
    <div style="background: #f8fafc; border-radius: 16px; padding: 32px; margin: 32px 0; border: 2px solid #e2e8f0;">
        <h3 style="margin: 0 0 24px 0; color: #1e293b; font-size: 20px; font-weight: 700; display: flex; align-items: center;">
            <span style="margin-right: 12px; font-size: 24px;">📋</span>
            Order Summary
        </h3>
        
        <div style="space-y: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-weight: 600; font-size: 15px;">Order ID</span>
                <span style="color: #1e293b; font-weight: 700; font-size: 15px; font-family: 'Courier New', monospace;">#${orderId}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-weight: 600; font-size: 15px;">Order Date</span>
                <span style="color: #1e293b; font-weight: 700; font-size: 15px;">${new Date(
                  orderDate
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                <span style="color: #64748b; font-weight: 600; font-size: 15px;">Total Amount</span>
                <span style="color: #10b981; font-weight: 800; font-size: 18px;">$${totalAmount.toFixed(
                  2
                )}</span>
            </div>
        </div>
    </div>
    
    <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); border-radius: 16px; padding: 28px; margin: 32px 0; color: white; text-align: center;">
        <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">📦 What Happens Next?</h3>
        <div style="text-align: left; max-width: 400px; margin: 0 auto;">
            <div style="margin-bottom: 12px; display: flex; align-items: center;">
                <span style="margin-right: 12px; font-size: 16px;">📧</span>
                <span style="opacity: 0.95; font-size: 14px;">You'll receive shipping updates via email</span>
            </div>
            <div style="margin-bottom: 12px; display: flex; align-items: center;">
                <span style="margin-right: 12px; font-size: 16px;">📦</span>
                <span style="opacity: 0.95; font-size: 14px;">Your items are being carefully prepared</span>
            </div>
            <div style="display: flex; align-items: center;">
                <span style="margin-right: 12px; font-size: 16px;">🚚</span>
                <span style="opacity: 0.95; font-size: 14px;">Fast and secure delivery to your door</span>
            </div>
        </div>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
        <a href="${
          process.env.FRONTEND_BASE_URL || "http://localhost:5173"
        }/orders" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);">
            📱 Track Your Order
        </a>
    </div>
    
    <p style="color: #64748b; font-size: 16px; line-height: 1.6; text-align: center; margin-top: 32px;">
        Thank you for choosing NovaMart. We appreciate your business! 🛍️✨
    </p>
  `;

  const mailOptions = {
    from: `"NovaMart" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "✅ Your NovaMart Order is Confirmed!",
    html: getEmailTemplate(content),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${email}`);
    return {
      success: true,
      message: `Order confirmation email sent to ${email}`,
    };
  } catch (error) {
    console.error(`Error sending order confirmation email to ${email}:`, error);
    throw new Error(
      `Failed to send order confirmation email: ${error.message}`
    );
  }
};

// Function to send role change notification email
const sendRoleChangeEmail = async (email, newRole) => {
  const roleDescriptions = {
    user: "a valued customer with access to shopping and exclusive member benefits.",
    seller:
      "a trusted seller with the ability to list and manage products on our marketplace.",
    admin:
      "an administrator with comprehensive access to manage the NovaMart platform.",
  };

  const roleIcons = {
    user: "👤",
    seller: "🏪",
    admin: "👑",
  };

  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); width: 88px; height: 88px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);">
            <span style="font-size: 40px;">${roleIcons[newRole] || "👤"}</span>
        </div>
        <h2 style="margin: 0; color: #1e293b; font-size: 32px; font-weight: 700;">Account Role Updated!</h2>
    </div>
    
    <p style="color: #475569; font-size: 18px; line-height: 1.7; margin-bottom: 24px; text-align: center;">
        We're excited to inform you about an important update to your NovaMart account.
    </p>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 32px; text-align: center; margin: 32px 0; color: white;">
        <p style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">🎉 New Role: ${
          newRole.charAt(0).toUpperCase() + newRole.slice(1)
        }</p>
        <p style="margin: 0; font-size: 16px; opacity: 0.95; line-height: 1.6;">You are now ${
          roleDescriptions[newRole] || "a member with updated privileges."
        }</p>
    </div>
    
    <div style="background: #f8fafc; border-radius: 16px; padding: 32px; margin: 32px 0; border-left: 4px solid #667eea;">
        <h3 style="margin: 0 0 20px 0; color: #1e293b; font-size: 20px; font-weight: 700; display: flex; align-items: center;">
            <span style="margin-right: 12px; font-size: 24px;">✨</span>
            What This Means for You
        </h3>
        <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0;">
            Your new role comes with enhanced features and capabilities. Log in to your account to explore your updated dashboard and discover all the new possibilities available to you.
        </p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
        <a href="${
          process.env.FRONTEND_BASE_URL || "http://localhost:5173"
        }/login" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 8px 24px rgba(6, 182, 212, 0.3); transition: all 0.3s ease;">
            🚀 Access Your Account
        </a>
    </div>
    
    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 28px 0;">
        <div style="display: flex; align-items: flex-start;">
            <span style="color: #d97706; font-size: 18px; margin-right: 12px;">⚠️</span>
            <div>
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600; margin-bottom: 4px;">Important Notice</p>
                <p style="margin: 0; color: #b45309; font-size: 13px; line-height: 1.4;">
                    If you believe this role change was made in error, please contact our support team immediately for assistance.
                </p>
            </div>
        </div>
    </div>
    
    <p style="color: #64748b; font-size: 16px; line-height: 1.6; text-align: center; margin-top: 32px;">
        We're thrilled to have you continue your journey with NovaMart! 🌟
    </p>
  `;

  const mailOptions = {
    from: `"NovaMart" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${
      roleIcons[newRole] || "👤"
    } Your NovaMart Account Role Has Been Updated`,
    html: getEmailTemplate(content),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Role change email sent to ${email}`);
    return { success: true, message: `Role change email sent to ${email}` };
  } catch (error) {
    console.error(`Error sending role change email to ${email}:`, error);
    throw new Error(`Failed to send role change email: ${error.message}`);
  }
};

export {
  sendOtpEmail,
  sendResetPasswordEmail,
  sendOrderConfirmationEmail,
  sendRoleChangeEmail,
};
