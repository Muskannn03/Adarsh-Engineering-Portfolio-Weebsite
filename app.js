/* -------------------------------------------------------------
   Adarsh Engineering Fabricators - Interactive Logic (app.js)
   ------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Helper to get correct API URL depending on how the frontend is opened/run (e.g., Live Server or file://)
    const getApiUrl = (endpoint) => {
        const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (window.location.protocol === 'file:' || (isLocalHost && window.location.port !== '3000' && window.location.port !== '')) {
            return `https://adarsh-engineering-portfolio.vercel.app${endpoint}`;
        }
        return endpoint;
    };

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

    // 4. Hardware-Accelerated Statistics Counter Animation (Requirement 6)
    function animateSingleCounter(stat) {
        if (stat.classList.contains('animating') || stat.classList.contains('animated')) return;
        stat.classList.add('animating');

        const target = parseInt(stat.getAttribute('data-target'), 10);
        const suffix = stat.getAttribute('data-suffix') || '';
        const noComma = stat.getAttribute('data-no-comma') === 'true';
        const duration = 1000; // Exactly 1.0 second duration (Requirement 6)
        let startTime = null;

        function updateCounter(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const currentVal = Math.floor(progress * target);
            stat.textContent = (noComma ? currentVal.toString() : currentVal.toLocaleString()) + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                stat.textContent = (noComma ? target.toString() : target.toLocaleString()) + suffix;
                stat.classList.remove('animating');
                stat.classList.add('animated');
            }
        }
        requestAnimationFrame(updateCounter);
    }

    // IntersectionObserver to animate counters when they enter viewport (Requirement 6)
    const countObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.stats-number, .metric-num');
                counters.forEach(stat => animateSingleCounter(stat));
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, { threshold: 0.15 });

    // Bind observers to count containers
    document.querySelectorAll('.hero-dashboard-panel, .about-stats-content').forEach(container => {
        countObserver.observe(container);
    });

    // 5. Scroll Section Animation Reveal (Requirement 9)
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('.reveal-section').forEach(section => {
        revealObserver.observe(section);
    });

    // 6. Desktop Mouse Parallax & Floating Card weight (Requirement 8, 11 & 16)
    const isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;

    if (!isMobile) {
        // Subtle Mouse Parallax (Requirement 11)
        const heroSection = document.querySelector('.hero-section');
        const bgImg = document.querySelector('.hero-bg-image');
        const heroText = document.querySelector('.hero-content');
        const gridOverlay = document.querySelector('.grid-overlay');

        if (heroSection) {
            heroSection.addEventListener('mousemove', (e) => {
                const rect = heroSection.getBoundingClientRect();
                const x = e.clientX - rect.left - (rect.width / 2);
                const y = e.clientY - rect.top - (rect.height / 2);

                const pctX = x / (rect.width / 2);
                const pctY = y / (rect.height / 2);

                // Move building image: 5px, Text overlay: 2px, Blueprint grid: 10px
                if (bgImg) bgImg.style.transform = `translate(${pctX * -5}px, ${pctY * -5}px) scale(1.03)`;
                if (heroText) heroText.style.transform = `translate(${pctX * -2}px, ${pctY * -2}px)`;
                if (gridOverlay) gridOverlay.style.transform = `translate(${pctX * -10}px, ${pctY * -10}px)`;
            });

            heroSection.addEventListener('mouseleave', () => {
                if (bgImg) bgImg.style.transform = '';
                if (heroText) heroText.style.transform = '';
                if (gridOverlay) gridOverlay.style.transform = '';
            });
        }

        // Floating Card Scroll Weight effect (Requirement 8)
        const floatingCard = document.querySelector('.hero-dashboard-panel');
        if (floatingCard) {
            window.addEventListener('scroll', () => {
                const scrollY = window.scrollY;
                if (scrollY <= 500) {
                    const progress = scrollY / 500;
                    const translateY = progress * -12; // Y: 0 -> -12px
                    const shadowBlur = 30 + (progress * 15);
                    const shadowOpacity = 0.05 + (progress * 0.05);

                    floatingCard.style.transform = `translateY(${translateY}px)`;
                    floatingCard.style.boxShadow = `0 ${shadowBlur}px 50px rgba(150, 27, 27, ${shadowOpacity})`;
                }
            }, { passive: true });
        }
    }

    // 7. Interactive Portfolio Project Filtering (Requirement 15 - 400ms Unified Fade Transition)
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const projectsGrid = document.querySelector('.projects-grid');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('active')) return;

            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            // Phase 1: Fade out container (200ms)
            if (projectsGrid) {
                projectsGrid.style.transition = 'opacity 200ms ease';
                projectsGrid.style.opacity = '0';
            }

            // Phase 2: After fade out completes, swap cards and fade back in (200ms mark)
            setTimeout(() => {
                projectCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    if (filterValue === 'all' || cardCategory === filterValue) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });

                // Phase 3: Fade back in (200ms)
                if (projectsGrid) {
                    projectsGrid.style.opacity = '1';
                }
            }, 200);
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

        // Determine correct endpoint (handle direct local file:// filesystem openings and alternative ports)
        const targetUrl = getApiUrl('/api/contact');

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
    const savedTheme = localStorage.getItem('theme_v2');
    
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
            localStorage.setItem('theme_v2', 'dark');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            localStorage.setItem('theme_v2', 'light');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    });

    // 10. Premium Custom Smooth Scroll (Requirement 14)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                // Close mobile drawer if open
                if (typeof mobileDrawer !== 'undefined' && mobileDrawer && mobileDrawer.classList.contains('open')) {
                    toggleMenu();
                }

                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - 80; // Offset navbar height
                const startPosition = window.scrollY;
                const distance = targetPosition - startPosition;
                const duration = 950; // 950ms smooth scroll
                let start = null;

                function scrollAnimationStep(timestamp) {
                    if (!start) start = timestamp;
                    const elapsed = timestamp - start;
                    const progress = Math.min(elapsed / duration, 1);

                    // Easing: easeInOutCubic
                    const ease = progress < 0.5 
                        ? 4 * progress * progress * progress 
                        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

                    window.scrollTo(0, startPosition + distance * ease);

                    if (elapsed < duration) {
                        requestAnimationFrame(scrollAnimationStep);
                    }
                }
                requestAnimationFrame(scrollAnimationStep);
            }
        });
    });

    // 9. Interactive Safety PPE Cards Click State Toggle
    const ppeCards = document.querySelectorAll('.ppe-card');
    ppeCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('active');
        });
    });

    // 11. Founder Portrait Photo Lightbox Pop-up
    const founderAvatar = document.querySelector('.founder-avatar-wrapper');
    const founderModal = document.getElementById('founder-modal');
    const closeLightbox = document.querySelector('.lightbox-close');

    if (founderAvatar && founderModal) {
        founderAvatar.addEventListener('click', () => {
            founderModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // stop page scroll
        });
        
        const closeModal = () => {
            founderModal.classList.remove('active');
            document.body.style.overflow = ''; // restore page scroll
        };
        
        if (closeLightbox) {
            closeLightbox.addEventListener('click', closeModal);
        }
        
        founderModal.addEventListener('click', (e) => {
            if (e.target === founderModal) {
                closeModal();
            }
        });
        
        // Close on Escape keypress
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && founderModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // ----------------------------------------------------
    // Feedback Star Rating, Loader & Form Handler
    // ----------------------------------------------------
    const starsContainer = document.getElementById('rating-stars-container');
    const ratingInput = document.getElementById('feedback-rating');
    const testimonialsList = document.getElementById('feedback-testimonials-list');
    
    // Set default stars state (5 stars active)
    const updateStars = (val) => {
        if (!starsContainer) return;
        const stars = starsContainer.querySelectorAll('.rating-star');
        stars.forEach((star) => {
            const starVal = parseInt(star.getAttribute('data-value'));
            if (starVal <= val) {
                star.classList.add('active');
                star.style.stroke = '#f59e0b';
                star.style.fill = '#f59e0b';
            } else {
                star.classList.remove('active');
                star.style.stroke = '';
                star.style.fill = '';
            }
        });
    };
    
    // Global delete review function (Supports password-free client deletion using local storage token)
    window.deleteReview = async (id) => {
        let deleteToken = null;
        
        // Find local storage deleteToken
        let myFeedbacks = JSON.parse(localStorage.getItem('my_feedbacks') || '[]');
        const matched = myFeedbacks.find(item => item.id === id);
        
        if (matched) {
            deleteToken = matched.deleteToken;
        }
        
        if (!confirm("Are you sure you want to delete your feedback? This action cannot be undone.")) return;
        
        // Optimistically remove the review card from the UI immediately
        const card = document.getElementById(`review-card-${id}`);
        if (card) {
            card.remove();
        }

        // If no review cards are left, show the fallback message
        const testimonialsList = document.getElementById('feedback-testimonials-list');
        if (testimonialsList && testimonialsList.querySelectorAll('.testimonial-card').length === 0) {
            testimonialsList.innerHTML = '<div class="testimonial-card"><p class="testimonial-text">No feedback yet. Be the first to write feedback!</p></div>';
        }
        
        try {
            const response = await fetch(getApiUrl('/api/feedback'), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, deleteToken })
            });
            
            const data = await response.json();
            if (data.success) {
                // Clean up local storage
                myFeedbacks = myFeedbacks.filter(item => item.id !== id);
                localStorage.setItem('my_feedbacks', JSON.stringify(myFeedbacks));
            }
        } catch (err) {
            console.error('Failed to delete review in background:', err);
        }
    };
    
    // Function to render reviews
    const renderReviews = (reviews) => {
        if (!testimonialsList) return;
        if (!reviews || reviews.length === 0) {
            testimonialsList.innerHTML = '<div class="testimonial-card"><p class="testimonial-text">No feedback yet. Be the first to write feedback!</p></div>';
            return;
        }

        const myFeedbacks = JSON.parse(localStorage.getItem('my_feedbacks') || '[]');

        testimonialsList.innerHTML = reviews.map((review) => {
            // Get initial letter of name
            const initial = review.name ? review.name.trim().charAt(0).toUpperCase() : 'U';
            
            // Build stars html
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= review.rating) {
                    starsHtml += '<i data-lucide="star" class="star-filled active" style="width:14px;height:14px;fill:#f59e0b;stroke:#f59e0b;margin-right:3px;"></i>';
                } else {
                    starsHtml += '<i data-lucide="star" style="width:14px;height:14px;stroke:var(--muted-foreground);margin-right:3px;"></i>';
                }
            }
            
            // Only render delete button if the review belongs to the current user (in localStorage)
            const isOwned = review.id && myFeedbacks.some(item => item.id === review.id);
            const deleteButtonHtml = isOwned ? `
                <button class="delete-review-btn" onclick="deleteReview('${review.id}')" title="Delete Feedback">
                    <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
                </button>
            ` : '';
            
            return `
                <div class="testimonial-card" id="review-card-${review.id}" style="position:relative;">
                    ${deleteButtonHtml}
                    <div class="testimonial-header">
                        <div class="testimonial-avatar">${initial}</div>
                        <div class="testimonial-meta">
                            <span class="client-name">${review.name}</span>
                            <span class="client-location">${review.date}</span>
                        </div>
                        <div class="testimonial-rating">
                            ${starsHtml}
                        </div>
                    </div>
                    <p class="testimonial-text">"${review.message}"</p>
                </div>
            `;
        }).join('');
        
        // Re-run lucide.createIcons() to render icons for the dynamically injected elements if lucide is available
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    };

    // Load reviews on page load
    const loadReviews = async () => {
        try {
            const response = await fetch(getApiUrl('/api/feedback'));
            const data = await response.json();
            if (data.success && data.reviews) {
                renderReviews(data.reviews);
            }
        } catch (err) {
            console.error('Failed to load reviews:', err);
        }
    };

    if (testimonialsList) {
        loadReviews();
    }
    
    if (ratingInput && starsContainer) {
        // Initialize default state
        setTimeout(() => {
            updateStars(parseInt(ratingInput.value));
        }, 100);
        
        // Click handler via delegation
        starsContainer.addEventListener('click', (e) => {
            const star = e.target.closest('.rating-star');
            if (star) {
                const val = parseInt(star.getAttribute('data-value'));
                ratingInput.value = val;
                updateStars(val);
            }
        });
        
        // Hover handler via delegation
        starsContainer.addEventListener('mouseover', (e) => {
            const star = e.target.closest('.rating-star');
            if (star) {
                const val = parseInt(star.getAttribute('data-value'));
                const stars = starsContainer.querySelectorAll('.rating-star');
                stars.forEach((s) => {
                    const sVal = parseInt(s.getAttribute('data-value'));
                    if (sVal <= val) {
                        s.style.stroke = '#f59e0b';
                        s.style.fill = '#f59e0b';
                    } else {
                        s.style.stroke = '';
                        s.style.fill = '';
                    }
                });
            }
        });
        
        // Mouse leave resets to selected rating
        starsContainer.addEventListener('mouseleave', () => {
            updateStars(parseInt(ratingInput.value));
        });
    }

    // Feedback Form Submission
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackMsg = document.getElementById('feedback-form-message');

    if (feedbackForm && feedbackMsg) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = feedbackForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Submitting...';
            
            const formData = {
                name: document.getElementById('feedback-name').value,
                rating: ratingInput.value,
                message: document.getElementById('feedback-message').value
            };

            try {
                const response = await fetch(getApiUrl('/api/feedback'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    feedbackMsg.className = 'form-message success';
                    feedbackMsg.style.display = 'block';
                    feedbackMsg.innerHTML = 'Thank you! Your feedback has been submitted successfully.';
                    feedbackForm.reset();
                    ratingInput.value = 5;
                    updateStars(5);
                    
                    // Track newly submitted feedback ID and secret deleteToken in localStorage
                    if (data.newReview && data.newReview.id && data.newReview.deleteToken) {
                        let myFeedbacks = JSON.parse(localStorage.getItem('my_feedbacks') || '[]');
                        myFeedbacks.push({ id: data.newReview.id, deleteToken: data.newReview.deleteToken });
                        localStorage.setItem('my_feedbacks', JSON.stringify(myFeedbacks));
                    }
                    
                    if (data.reviews) {
                        renderReviews(data.reviews);
                    } else {
                        loadReviews();
                    }
                } else {
                    feedbackMsg.className = 'form-message error';
                    feedbackMsg.style.display = 'block';
                    feedbackMsg.innerHTML = data.message || 'There was a problem submitting your feedback. Please try again.';
                }
            } catch (err) {
                console.error(err);
                feedbackMsg.className = 'form-message error';
                feedbackMsg.style.display = 'block';
                feedbackMsg.innerHTML = 'Oops! There was a problem submitting your feedback. Please try again.';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        });
    }
});
