const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // For development, we'll use Gmail SMTP
  // In production, you'd want to use a proper email service like SendGrid, AWS SES, etc.
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // Your Gmail app password
    },
  });
};

// Send group invitation email
const sendGroupInvitation = async ({ 
  recipientEmail, 
  recipientName = 'Researcher',
  senderName, 
  groupName, 
  groupDescription,
  personalMessage = '',
  inviteLink 
}) => {
  try {
    const transporter = createTransporter();

    // Create email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Research Group Invitation</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 12px; margin-bottom: 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; }
          .personal-message { background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0891b2; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Research Group Invitation</h1>
            <p>You've been invited to join an exciting research collaboration!</p>
          </div>
          
          <div class="content">
            <h2>Hello ${recipientName}! 👋</h2>
            
            <p><strong>${senderName}</strong> has invited you to join the research group:</p>
            
            <h3>📚 ${groupName}</h3>
            <p>${groupDescription}</p>
            
            ${personalMessage ? `
              <div class="personal-message">
                <h4>💬 Personal Message:</h4>
                <p><em>"${personalMessage}"</em></p>
              </div>
            ` : ''}
            
            <p>Join this research group to:</p>
            <ul>
              <li>🤝 Collaborate with fellow researchers</li>
              <li>📄 Share and discuss research papers</li>
              <li>🎯 Track project milestones together</li>
              <li>💡 Exchange ideas and insights</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${inviteLink}" class="button">
                🚀 Join Research Group
              </a>
            </div>
            
            <p><small>This invitation link will expire in 7 days for security reasons.</small></p>
          </div>
          
          <div class="footer">
            <p>This invitation was sent through Chatademy Research Hub</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Research Group Invitation

Hello ${recipientName}!

${senderName} has invited you to join the research group: ${groupName}

${groupDescription}

${personalMessage ? `Personal Message: "${personalMessage}"` : ''}

Join this research group to collaborate with fellow researchers, share papers, track milestones, and exchange ideas.

Click here to join: ${inviteLink}

This invitation link will expire in 7 days for security reasons.

---
This invitation was sent through Chatademy Research Hub
If you didn't expect this invitation, you can safely ignore this email.
    `;

    // Send email
    const mailOptions = {
      from: `"Chatademy Research Hub" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `🎓 Invitation to join "${groupName}" research group`,
      text: textContent,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', result.messageId);
    return {
      success: true,
      messageId: result.messageId,
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  sendGroupInvitation,
};
