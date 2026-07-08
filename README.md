# Adarsh Engineering Fabricators

A premium, modern, and highly responsive company portfolio website built for **Adarsh Engineering Fabricators**. The site showcases architectural glazing, ACP cladding, metal/structural fabrication, and industrial mechanical engineering works.

**Live Website**: [https://adarsh-engineering-portfolio.vercel.app/](https://adarsh-engineering-portfolio.vercel.app/)

---

## 🚀 Key Features

* **High-End Aesthetics**: Built with tailored typographic systems, glassmorphism, alternating layout sections, and subtle micro-animations.
* **Dual Theme Engine**: Supports instant transition between **Light Mode** and a soft **Charcoal Dark Theme**.
* **Dynamic Gallery Filtering**: An interactive filter dock to easily sort between *Industrial* and *Architectural Façade* completed projects.
* **Interactive Lightbox Modal**: View high-resolution portraits of the founder with full esc-key, overlay click, and scroll lock controls.
* **Functional Inquiry Form**: A backend-connected contact form that sends customer requests directly to the company inbox via serverless processing.
* **SEO Optimized**: Pre-configured with meta keywords, description, index robots, and standard multi-size search listing favicons.

---

## 🛠️ Technology Stack

* **Frontend**: HTML5, Vanilla CSS3 (Variables, Flexbox/Grid, transitions), JavaScript (ES6+).
* **Backend API**: Node.js, Nodemailer (SMTP secure mailer).
* **Assets**: Lucide Icons, Google Fonts (Inter, Plus Jakarta Sans, Cinzel, Alex Brush).
* **Hosting**: Vercel (Static files hosting & Serverless functions execution).

---

## ⚙️ Project Setup

### 1. Clone the repository
```bash
git clone https://github.com/Muskannn03/Adarsh-Engineering-Portfolio-Weebsite.git
cd Adarsh-Engineering-Portfolio-Weebsite
```

### 2. Local Environment Variables
Create a `.env` file in the root directory to configure the contact form backend:
```env
PORT=3000
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-google-app-password
RECEIVER_EMAIL=inbox-recipient@gmail.com
```

> [!NOTE]  
> Gmail requires a **16-digit App Password** instead of your standard personal password. You can generate one in your [Google Account Security Settings](https://myaccount.google.com/security).

---

## 📦 Deployment to Vercel

The project uses Vercel's zero-config serverless engine:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Configure Environment Variables**:
   Set the following variables in the Vercel Project Dashboard (under Settings > Environment Variables):
   * `EMAIL_USER`
   * `EMAIL_PASS` (16-digit Google App Password)
   * `RECEIVER_EMAIL`

3. **Deploy to production**:
   ```bash
   vercel --prod
   ```
