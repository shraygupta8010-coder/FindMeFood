const nodemailer = require('nodemailer');

// Create a test email transporter (doesn't send real emails in development)
const createTestTransporter = () => {
  return {
    sendMail: (mailOptions) => {
      console.log('📧 EMAIL SIMULATION (Development Mode)');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Content Preview:', mailOptions.html?.substring(0, 200) + '...');
      console.log('---');
      return Promise.resolve({ messageId: 'test-message-id' });
    }
  };
};

// Use test transporter in development
const transporter = process.env.NODE_ENV === 'production' 
  ? nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  : createTestTransporter();

// @desc    Send OTP email for verification
const sendOTPEmail = async (email, otp) => {
  try {
    const subject = 'Verify Your Email - FindMeFood';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #4CAF50; }
              .otp-code { background: #f8f9fa; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50; border-radius: 5px; margin: 20px 0; }
              .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">🍽️ FindMeFood</div>
                  <h2>Verify Your Email Address</h2>
              </div>
              
              <p>Hello,</p>
              <p>Thank you for registering with FindMeFood! Use the OTP below to verify your email address:</p>
              
              <div class="otp-code">${otp}</div>
              
              <p>This OTP will expire in 10 minutes.</p>
              <p>If you didn't create an account with FindMeFood, please ignore this email.</p>
              
              <div class="footer">
                  <p>© 2024 FindMeFood. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@findmefood.com',
      to: email,
      subject: subject,
      html: html
    });

    console.log(`✅ OTP email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ OTP email failed:', error);
    return false;
  }
};

// @desc    Send welcome email after verification
const sendWelcomeEmail = async (email, name) => {
  try {
    const subject = 'Welcome to FindMeFood! 🎉';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #4CAF50; }
              .welcome-icon { font-size: 48px; margin: 20px 0; }
              .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">🍽️ FindMeFood</div>
                  <div class="welcome-icon">🎉</div>
                  <h2>Welcome to FindMeFood, ${name}!</h2>
              </div>
              
              <p>We're excited to have you join our community of food donors and NGOs working together to reduce food waste.</p>
              
              <h3>What you can do:</h3>
              <ul>
                  <li>🍽️ Donate excess food to nearby NGOs</li>
                  <li>📍 Find verified NGOs in your area</li>
                  <li>🤖 Use AI-powered food verification</li>
                  <li>📱 Track your donation status</li>
              </ul>
              
              <p>Ready to make your first donation? <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/create-donation">Start here</a></p>
              
              <div class="footer">
                  <p>Thank you for helping us fight food waste!<br>© 2024 FindMeFood. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'welcome@findmefood.com',
      to: email,
      subject: subject,
      html: html
    });

    console.log(`✅ Welcome email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Welcome email failed:', error);
    return false;
  }
};

// @desc    Send donation status update email to user
const sendStatusUpdateEmail = async (to, donorName, foodType, oldStatus, newStatus, ngoName) => {
  try {
    const subject = `Your ${foodType} donation status updated`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Donation Status Update</h2>
        <p>Hello ${donorName || 'Donor'},</p>
        <p>Your <strong>${foodType}</strong> donation status has been updated:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>From:</strong> ${oldStatus}</p>
          <p><strong>To:</strong> ${newStatus}</p>
          ${ngoName ? `<p><strong>By NGO:</strong> ${ngoName}</p>` : ''}
        </div>
        <p>Thank you for your contribution to fighting hunger!</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This is an automated message from FindMeFood.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@findmefood.com',
      to: to,
      subject: subject,
      html: html
    });

    console.log(`✅ Status update email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

// @desc    Send new donation notification to NGOs (ENHANCED VERSION)
const sendNewDonationEmail = async (to, ngoName, foodType, location, contactInfo = null) => {
  try {
    const isSelectedNGO = !!contactInfo; // If contactInfo provided, it's a selected NGO
    
    const subject = isSelectedNGO 
      ? `🎉 You've been selected for a ${foodType} donation!` 
      : `New ${foodType} donation available near you`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; padding: 20px; border-radius: 10px; }
              .selected-header { background: linear-gradient(135deg, #10b981, #059669); color: white; }
              .general-header { background: linear-gradient(135deg, #e97328, #f59e0b); color: white; }
              .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .alert { background: #dcfce7; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 15px 0; }
              .info-card { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 10px 0; }
              .btn { display: inline-block; background: #e97328; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 0.9em; }
              .contact-info { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 15px 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header ${isSelectedNGO ? 'selected-header' : 'general-header'}">
                  <div class="logo">🍽️ FindMeFood</div>
                  <h2>${isSelectedNGO ? '🎉 You\'ve Been Selected!' : 'New Donation Available'}</h2>
                  <p>${isSelectedNGO ? 'The donor has specifically chosen your NGO!' : 'A new food donation is available near you'}</p>
              </div>
              
              ${isSelectedNGO ? `
              <div class="alert">
                  <strong>🚀 Priority Donation:</strong> You have been specifically selected by the donor for this donation!
              </div>
              ` : ''}
              
              <div class="info-card">
                  <h3>🍽️ Donation Details</h3>
                  <p><strong>Food Type:</strong> ${foodType}</p>
                  <p><strong>Location:</strong> ${location}</p>
                  ${isSelectedNGO ? '<p><strong>Status:</strong> 🎯 Selected NGO - Please contact donor ASAP</p>' : '<p><strong>Status:</strong> Available for acceptance</p>'}
              </div>
              
              ${contactInfo ? `
              <div class="contact-info">
                  <h3>📞 Donor Contact Information</h3>
                  <p><strong>Name:</strong> ${contactInfo.name}</p>
                  <p><strong>Phone:</strong> ${contactInfo.phone}</p>
                  ${contactInfo.email ? `<p><strong>Email:</strong> ${contactInfo.email}</p>` : ''}
                  <p style="margin-top: 10px; font-size: 0.9em; color: #059669;">
                      <strong>💡 Important:</strong> Please contact the donor within 1 hour to coordinate pickup.
                  </p>
              </div>
              ` : ''}
              
              <div style="text-align: center; margin: 25px 0;">
                  <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/ngo-dashboard" class="btn">
                      📊 View in Dashboard
                  </a>
              </div>
              
              ${isSelectedNGO ? `
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <strong>💡 Action Required:</strong> 
                  <ul>
                      <li>Contact the donor within 1 hour to confirm pickup</li>
                      <li>Update the donation status in your dashboard</li>
                      <li>Coordinate pickup time directly with the donor</li>
                      <li>Mark as completed after successful pickup</li>
                  </ul>
              </div>
              ` : `
              <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                  <strong>💡 Quick Response:</strong> 
                  <ul>
                      <li>Accept donations quickly for better donor experience</li>
                      <li>Contact donors promptly to coordinate pickup</li>
                      <li>Update donation status in your dashboard</li>
                  </ul>
              </div>
              `}
              
              <div class="footer">
                  <p>This is an automated message from FindMeFood - Connecting food donors with NGOs</p>
                  <p>Need help? Contact support: support@findmefood.org</p>
              </div>
          </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@findmefood.com',
      to: to,
      subject: subject,
      html: html
    });

    console.log(`✅ ${isSelectedNGO ? 'Selected NGO' : 'General'} donation notification sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

// @desc    Send contact form submission confirmation
const sendContactConfirmationEmail = async (email, name, subject, messageId) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #e97328, #f59e0b); color: white; padding: 20px; border-radius: 10px; }
              .logo { font-size: 24px; font-weight: bold; }
              .ticket { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
              .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">🍽️ FindMeFood</div>
                  <h2>Thank You for Contacting Us!</h2>
              </div>
              
              <p>Hello ${name},</p>
              <p>We've received your message and our team will get back to you within 24 hours.</p>
              
              <div class="ticket">
                  <strong>Ticket Reference:</strong><br>
                  <span style="font-size: 18px; font-weight: bold; color: #e97328;">FMF-${messageId.toString().padStart(6, '0')}</span>
              </div>
              
              <p><strong>Subject:</strong> ${subject}</p>
              
              <p>If you have any urgent inquiries, please feel free to contact us at support@findmefood.org</p>
              
              <div class="footer">
                  <p>© 2024 FindMeFood. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@findmefood.com',
      to: email,
      subject: 'We\'ve Received Your Message - FindMeFood',
      html: html
    });

    console.log(`✅ Contact confirmation sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Contact confirmation email failed:', error);
    return false;
  }
};

// @desc    Send admin notification for new contact message
const sendAdminNotificationEmail = async (name, email, subject, message, category = 'general') => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e97328;">New Contact Form Submission</h2>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong><br>${message}</p>
        </div>
        
        <p>Please respond to this inquiry within 24 hours.</p>
        
        <hr>
        <p style="color: #666; font-size: 12px;">
          FindMeFood Contact System
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@findmefood.com',
      to: process.env.ADMIN_EMAIL || 'admin@findmefood.com',
      subject: `New Contact: ${subject}`,
      html: html
    });

    console.log(`✅ Admin notification sent for contact from: ${name}`);
    return true;
  } catch (error) {
    console.error('❌ Admin notification email failed:', error);
    return false;
  }
};

// Keep old function for backward compatibility
const sendVerificationEmail = async (email, token) => {
  // Fallback to OTP email for now
  return await sendOTPEmail(email, '123456'); // Default OTP
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendStatusUpdateEmail,
  sendNewDonationEmail,
  sendContactConfirmationEmail,
  sendAdminNotificationEmail,
  sendVerificationEmail // For backward compatibility
};