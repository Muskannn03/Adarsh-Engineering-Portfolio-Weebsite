/* -------------------------------------------------------------
   Adarsh Engineering Fabricators - Interactive Logic (app.js)
   ------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Sticky Header scroll transition
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Mobile Navigation Hamburger Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const menuIconOpen = menuToggle.querySelector('.menu-icon-open');
    const menuIconClose = menuToggle.querySelector('.menu-icon-close');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    function toggleMenu() {
        const isOpen = mobileDrawer.classList.toggle('open');
        if (isOpen) {
            menuIconOpen.style.display = 'none';
            menuIconClose.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Lock background scroll
        } else {
            menuIconOpen.style.display = 'block';
            menuIconClose.style.display = 'none';
            document.body.style.overflow = ''; // Unlock background scroll
        }
    }

    menuToggle.addEventListener('click', toggleMenu);
    
    // Close drawer on click of any mobile link
    drawerLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileDrawer.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    // 4. Interactive Statistics Counter Animation on Load & Scroll
    function animateSingleCounter(stat) {
        const target = parseInt(stat.getAttribute('data-target'), 10);
        const suffix = stat.getAttribute('data-suffix') || '';
        const duration = 1500; // 1.5 seconds for snappier animation
        const stepTime = Math.max(Math.abs(Math.floor(duration / target)), 10); // Minimum 10ms step to avoid locking CPU
        let current = 0;
        
        // Adjust step increments for larger numbers (like 2011 or 500) to avoid lagging
        const increment = target > 1000 ? 19 : (target > 100 ? 5 : 1);
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.textContent = target.toLocaleString() + suffix;
                clearInterval(timer);
            } else {
                stat.textContent = current.toLocaleString() + suffix;
            }
        }, stepTime);
    }

    // Animate Hero Counters immediately
    const heroStats = document.querySelectorAll('.hero-dashboard-panel .stats-number');
    heroStats.forEach(stat => {
        setTimeout(() => {
            animateSingleCounter(stat);
        }, 300); // Small delay to let the fade-in animation finish
    });

    // IntersectionObserver to trigger counter animation when about section stats are visible
    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const aboutStats = entry.target.querySelectorAll('.stats-number');
                aboutStats.forEach(stat => animateSingleCounter(stat));
                observer.unobserve(entry.target); // Trigger once
            }
        });
    }, { threshold: 0.3 });

    const statsSection = document.querySelector('.about-stats-content');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // 5. Interactive Portfolio Project Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            projectCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                // Add smooth scale reveal animation
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                
                if (filterValue === 'all' || cardCategory === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // 7. Interactive Contact Form Submission & Validation (FormSubmit.co)
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameVal = document.getElementById('name').value.trim();
        const emailVal = document.getElementById('email').value.trim();
        const phoneVal = document.getElementById('phone').value.trim();
        const messageVal = document.getElementById('message').value.trim();

        // Simple Validation
        if (!nameVal || !emailVal || !messageVal) {
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Please fill out all required fields.';
            return;
        }

        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';

        // Determine correct endpoint (handle direct local file:// filesystem openings)
        const targetUrl = window.location.protocol === 'file:' 
            ? 'http://localhost:3000/api/contact' 
            : '/api/contact';

        // Send AJAX request to local Express backend (serviced by Nodemailer)
        fetch(targetUrl, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: nameVal,
                email: emailVal,
                phone: phoneVal,
                subject: `Website Contact Form: ${nameVal}`,
                message: messageVal
            })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Server response error");
            }
        })
        .then(data => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
            
            if (data.success) {
                formMessage.className = 'form-message success';
                formMessage.textContent = `Thank you, ${nameVal}! Your inquiry has been sent. We will get back to you shortly.`;
                contactForm.reset();
            } else {
                formMessage.className = 'form-message error';
                formMessage.textContent = data.message || 'Oops! There was a problem sending your message.';
            }
        })
        .catch(err => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
            
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Oops! There was a problem sending your message. Please try again or contact us directly.';
            console.error('Error submitting form:', err);
        });
    });

    // 8. Navigation active links on scroll observer
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });

    // Theme Toggle Functionality
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = themeToggleBtn.querySelector('.theme-icon-light');
    const moonIcon = themeToggleBtn.querySelector('.theme-icon-dark');
    
    // Check local storage (default to light mode unless explicitly saved as dark)
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        document.documentElement.classList.remove('dark');
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
    
    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        if (isDark) {
            localStorage.setItem('theme', 'dark');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            localStorage.setItem('theme', 'light');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    });

    // 9. Interactive Safety PPE Cards Click State Toggle
    const ppeCards = document.querySelectorAll('.ppe-card');
    ppeCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('active');
        });
    });
});
