const nodemailer = require('nodemailer');

const BUCKET_ID = 'adarsh_eng_feedback_v1_98a72b';
const KV_URL = `https://kvdb.io/${BUCKET_ID}/reviews`;

const seedReviews = [
    {
        name: "Perrigo Laboratories",
        rating: 5,
        message: "The structural glazing and ACP cladding work executed by Adarsh Engineering at our Ambernath facility is outstanding. Their precision fabrication meets our strict quality standards.",
        date: "Jul 4, 2026"
    },
    {
        name: "Alkem Laboratories",
        rating: 5,
        message: "Exceptional quality in heavy utility piping and structural steel works. Their team demonstrated high technical capability and safety compliance throughout the project.",
        date: "Jun 28, 2026"
    },
    {
        name: "Asian Paints Pvt. Ltd.",
        rating: 5,
        message: "Adarsh Engineering has been our trusted partner for architectural canopies and custom structural fabrications. Their commitment to integrity and timeline is exemplary.",
        date: "Jun 20, 2026"
    }
];

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        try {
            const response = await fetch(KV_URL);
            
            if (response.status === 404) {
                await fetch(KV_URL, {
                    method: 'PUT',
                    body: JSON.stringify(seedReviews)
                });
                return res.status(200).json({ success: true, reviews: seedReviews });
            }
            
            const data = await response.json();
            return res.status(200).json({ success: true, reviews: data });
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

            return res.status(200).json({ success: true, message: 'Feedback saved successfully!', reviews });
        } catch (error) {
            console.error('Error saving review:', error);
            return res.status(500).json({ success: false, message: 'Server error saving feedback.' });
        }
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
};
