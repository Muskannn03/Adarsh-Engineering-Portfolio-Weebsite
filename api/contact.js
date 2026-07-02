const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // Add CORS headers for serverless environment
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method Not Allowed' 
        });
    }

    const { name, email, phone, subject, message } = req.body;
    
    // Server-side validation
    if (!name || !email || !message) {
        return res.status(400).json({ 
            success: false, 
            message: 'Name, email, and message are required fields.' 
        });
    }

    // Check if email credentials are configured
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const receiver = process.env.RECEIVER_EMAIL || user;

    if (!user || !pass) {
        console.warn('⚠️ [Warning] Nodemailer credentials are not fully configured in your Vercel environment.');
        console.log('📬 [Simulation Mode] Logging message contents:');
        console.log(`From: ${name} (${email}) | Phone: ${phone || 'N/A'} | Subject: ${subject || 'N/A'}`);
        console.log(`Message: ${message}`);
        
        return res.json({ 
            success: true, 
            message: 'Message processed successfully (Vercel credential simulation mode).' 
        });
    }

    // Configure Nodemailer transporter (Gmail service)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass
        }
    });

    // Email content layout
    const mailOptions = {
        from: `"${name}" <${user}>`,
        to: receiver,
        replyTo: email,
        subject: `[Adarsh Website] Contact Submission: ${subject || 'General Inquiry'}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nSubject: ${subject || 'N/A'}\n\nMessage:\n${message}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="background-color: #961B1B; padding: 20px; text-align: center; color: #ffffff;">
                    <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.5px;">New Website Contact</h2>
                </div>
                <div style="padding: 24px; color: #334155; line-height: 1.5;">
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; width: 30%;">Name:</td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Email:</td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${email}" style="color: #961B1B;">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Phone:</td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${phone || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Subject:</td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${subject || 'N/A'}</td>
                        </tr>
                    </table>
                    
                    <div style="background-color: #f8fafc; border-radius: 6px; padding: 16px; border-left: 4px solid #961B1B;">
                        <h4 style="margin: 0 0 8px 0; color: #475569;">Message:</h4>
                        <p style="margin: 0; white-space: pre-wrap; font-size: 14px;">${message}</p>
                    </div>
                </div>
                <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                    Received on ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Your message has been sent successfully!' });
    } catch (error) {
        console.error('❌ Nodemailer failed:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to process your request. Please try again later.' 
        });
    }
};
