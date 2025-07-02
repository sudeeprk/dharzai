"use server";

import { Resend } from "resend";

const resendClient = new Resend(process.env.RESEND_API_KEY);

const fromEmail = "Dharz AI <admin@mail.thinkroman.com>";
const replyTo = "admin@mail.thinkroman.com";

export const sendAccountCreationEmail = async (
  userEmail: string,
  userName: string,
  password: string,
  whatsappNumber: string
) => {
  try {
    const logoUrl = process.env.NEXT_PUBLIC_BASE_URL
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`
      : "https://example.com/default-logo.png";

    await resendClient.emails.send({
      from: fromEmail,
      to: userEmail,
      replyTo: replyTo,
      subject: "Dharz AI – Account Created!",
      html: `<!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dharz AI – Account Created</title>
      <style>
          body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
              margin: 0;
              padding: 0;
              background-color: #f6f9fc;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
          }
          .email-wrapper {
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
              padding: 30px;
          }
          .logo {
              text-align: center;
              margin-bottom: 20px;
          }
          .logo img {
              max-height: 60px;
          }
          .content {
              text-align: center;
          }
          h1 {
              color: #0a5185;
              font-size: 22px;
              font-weight: 600;
              margin-bottom: 20px;
          }
          .message {
              margin-bottom: 25px;
              font-size: 15px;
          }
          .login-details {
              background-color: #f0f7ff;
              border-radius: 6px;
              padding: 20px;
              margin: 20px 0;
              text-align: left;
              border-left: 4px solid #28a745;
          }
          .details-icon {
              display: inline-block;
              background-color: #0a5185;
              color: #ffffff;
              font-weight: bold;
              padding: 5px 12px;
              border-radius: 20px;
              font-size: 12px;
              margin-bottom: 15px;
          }
          .details-item {
              margin-bottom: 10px;
          }
          .details-label {
              font-weight: bold;
              color: #0a5185;
              margin-right: 10px;
          }
          .access-methods {
              background-color: #eafbef;
              border-radius: 6px;
              padding: 20px;
              margin: 20px 0;
          }
          .cta-button {
              display: inline-block;
              background-color: #0a5185;
              color: #ffffff !important;
              text-decoration: none;
              padding: 12px 25px;
              border-radius: 6px;
              margin-top: 15px;
              font-weight: bold;
          }
          .footer {
              text-align: center;
              font-size: 13px;
              color: #777777;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eeeeee;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="email-wrapper">
              <div class="logo">
                  <img src="${logoUrl}" alt="Dharz AI Logo">
              </div>
              <div class="content">
                  <h1>Welcome to Dharz AI!</h1>
                  <p class="message">Dear ${userName}, your account has been successfully created.</p>
  
                  <div class="login-details">
                      <span class="details-icon">ACCOUNT DETAILS</span>
                      <div class="details-item">
                          <span class="details-label">📧 Email:</span> ${userEmail}
                      </div>
                      <div class="details-item">
                          <span class="details-label">🔒 Password:</span> ${password}
                      </div>
                      <div class="details-item">
                          <span class="details-label">📱 WhatsApp:</span> ${whatsappNumber}
                      </div>
                  </div>
  
                  <div class="access-methods">
                      <h3>How to Access Your Account</h3>
                      <p>✅ Email & Password: Log in with your registered email and password.</p>
  
                      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login" class="cta-button">Access Your Account Now</a>
                  </div>
  
              </div>
              <div class="footer">
                  <p>Cheers,</p>
                  <p>The Dharz AI Team</p>
                  <p>&copy; 2025 Dharz AI. All rights reserved.</p>
              </div>
          </div>
      </div>
  </body>
  </html>`,
    });
  } catch (error) {
    console.error("Failed to send account creation email:", error);
  }
};
