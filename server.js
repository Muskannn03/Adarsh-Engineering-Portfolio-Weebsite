require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Custom CORS Middleware to allow cross-origin requests (e.g. from local file:// origin)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200); // Quick response for CORS preflight
    }
    next();
});

// Middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from current directory
app.use(express.static(__dirname));

// POST endpoint for contact form submissions
app.post('/api/contact', async (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    
    // Server-side validation
    if (!name || !email || !message) {
        return res.status(400).json({ 
            success: false, 
            message: 'Name, email, and message are required fields.' 
        });
    }

    console.log(`[Form Received] Name: ${name}, Email: ${email}, Subject: ${subject || 'None'}`);

    // Check if email credentials are configured
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const receiver = process.env.RECEIVER_EMAIL || 'adarshenigineering07@gmail.com';

    if (!user || !pass) {
        console.warn('⚠️  [Warning] Nodemailer credentials (EMAIL_USER / EMAIL_PASS) are not fully configured in your .env file.');
        console.log('📬  [Simulation Mode] Logging message contents below:');
        console.log('--------------------------------------------------');
        console.log(`From: ${name} (${email})`);
        console.log(`Phone: ${phone || 'N/A'}`);
        console.log(`Subject: ${subject || 'N/A'}`);
        console.log(`Message: ${message}`);
        console.log('--------------------------------------------------');
        
        return res.json({ 
            success: true, 
            message: 'Message logged successfully (Server running in credential simulation mode).' 
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
        console.log('✅ Email sent successfully!');
        res.json({ success: true, message: 'Your message has been sent successfully!' });
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to process your request. Please try again later or contact us directly at adarshenigineering07@gmail.com' 
        });
    }
});

// Fallback to serve index.html for undefined routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Adarsh Engineering Fabricators Server is now running!`);
    console.log(`🔗 Local Address: http://localhost:${PORT}`);
    console.log(`💡 Configure your email in the .env file to enable live Nodemailer delivery.\n`);
});
