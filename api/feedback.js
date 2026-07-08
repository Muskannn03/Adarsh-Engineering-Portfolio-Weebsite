const nodemailer = require('nodemailer');

const KV_URL = 'https://jsonblob.com/api/jsonBlob/019f41bb-6f71-7954-8b33-2911b93994b3';

const seedReviews = [];

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        try {
            const response = await fetch(KV_URL);
            
            if (response.status === 404) {
                await fetch(KV_URL, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(seedReviews)
                });
                return res.status(200).json({ success: true, reviews: seedReviews });
            }
            
            const data = await response.json();
            // Sanitize: hide deleteToken from public GET response
            const sanitizedReviews = data.map(({ deleteToken, ...rest }) => rest);
            return res.status(200).json({ success: true, reviews: sanitizedReviews });
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return res.status(200).json({ success: true, reviews: seedReviews });
        }
    }

    if (req.method === 'POST') {
        const { name, rating, message } = req.body;
        
        if (!name || !rating || !message) {
            return res.status(400).json({ success: false, message: 'Name, rating, and message are required.' });
        }

        try {
            let reviews = [];
            const response = await fetch(KV_URL);
            if (response.status === 200) {
                reviews = await response.json();
            } else if (response.status === 404) {
                reviews = [...seedReviews];
            }

            const newReview = {
                id: Math.random().toString(36).substring(2, 11),
                deleteToken: Math.random().toString(36).substring(2, 15), // secret client deletion token
                name: name.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
                rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
                message: message.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            };

            reviews.unshift(newReview);
            if (reviews.length > 15) {
                reviews = reviews.slice(0, 15);
            }

            await fetch(KV_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviews)
            });

            const user = process.env.EMAIL_USER;
            const pass = process.env.EMAIL_PASS;
            const receiver = process.env.RECEIVER_EMAIL || 'adarshengineering07@gmail.com';

            if (user && pass) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: { user, pass }
                });

                const mailOptions = {
                    from: `"${name} (Feedback)" <${user}>`,
                    to: receiver,
                    subject: `[Adarsh Website] New Client Feedback: ${rating} Stars`,
                    text: `Name: ${name}\nRating: ${rating} Stars\nDate: ${newReview.date}\n\nFeedback:\n${message}`
                };
                
                await transporter.sendMail(mailOptions).catch(err => console.error('Nodemailer failed:', err));
            }

            // Return full newReview to creator so they receive the deleteToken
            const sanitizedReviews = reviews.map(({ deleteToken, ...rest }) => rest);
            return res.status(200).json({ success: true, message: 'Feedback saved successfully!', reviews: sanitizedReviews, newReview });
        } catch (error) {
            console.error('Error saving review:', error);
            return res.status(500).json({ success: false, message: 'Server error saving feedback.' });
        }
    }

    if (req.method === 'DELETE') {
        const { id, deleteToken, password } = req.body;
        
        if (!id) {
            return res.status(400).json({ success: false, message: 'Review ID is required.' });
        }

        try {
            let reviews = [];
            const response = await fetch(KV_URL);
            if (response.status === 200) {
                reviews = await response.json();
            }

            const targetReview = reviews.find(r => r.id === id);
            if (!targetReview) {
                return res.status(404).json({ success: false, message: 'Review not found.' });
            }

            const adminPass = process.env.ADMIN_PASS || 'adarsh07';
            const isAuthorized = (deleteToken && targetReview.deleteToken === deleteToken) || (password && password === adminPass);

            if (!isAuthorized) {
                return res.status(401).json({ success: false, message: 'Unauthorized. Invalid deletion credentials.' });
            }

            // Filter out matching review by ID
            reviews = reviews.filter(r => r.id !== id);

            await fetch(KV_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviews)
            });

            const sanitizedReviews = reviews.map(({ deleteToken, ...rest }) => rest);
            return res.status(200).json({ success: true, message: 'Review deleted successfully!', reviews: sanitizedReviews });
        } catch (error) {
            console.error('Error deleting review:', error);
            return res.status(500).json({ success: false, message: 'Server error deleting feedback.' });
        }
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
};
