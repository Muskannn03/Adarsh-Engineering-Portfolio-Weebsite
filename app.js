document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Dark/Light Theme Toggle
    // -------------------------------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIconDark = themeToggleBtn.querySelector('.theme-icon-dark');
    const themeIconLight = themeToggleBtn.querySelector('.theme-icon-light');

    // Load initial theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    document.body.className = savedTheme;
    updateThemeIcons(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        let currentTheme = document.body.className;
        let newTheme = 'light-theme';

        if (currentTheme === 'light-theme') {
            newTheme = 'dark-theme';
        }

        document.body.className = newTheme;
        localStorage.setItem('theme', newTheme);
        updateThemeIcons(newTheme);
    });

    function updateThemeIcons(theme) {
        if (theme === 'dark-theme') {
            themeIconDark.style.display = 'none';
            themeIconLight.style.display = 'block';
        } else {
            themeIconDark.style.display = 'block';
            themeIconLight.style.display = 'none';
        }
    }

    // -------------------------------------------------------------
    // 2. Sticky Navbar & Scroll Indicators
    // -------------------------------------------------------------
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        // Sticky class toggle
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active link tracking
        let scrollY = window.pageYOffset;
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // -------------------------------------------------------------
    // 3. Mobile Navigation Drawer
    // -------------------------------------------------------------
    const menuToggle = document.getElementById('menu-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const menuIconOpen = menuToggle.querySelector('.menu-icon-open');
    const menuIconClose = menuToggle.querySelector('.menu-icon-close');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    menuToggle.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.contains('open');
        if (isOpen) {
            mobileDrawer.classList.remove('open');
            menuIconOpen.style.display = 'block';
            menuIconClose.style.display = 'none';
        } else {
            mobileDrawer.classList.add('open');
            menuIconOpen.style.display = 'none';
            menuIconClose.style.display = 'block';
        }
    });

    // Close drawer when link clicked
    drawerLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileDrawer.classList.remove('open');
            menuIconOpen.style.display = 'block';
            menuIconClose.style.display = 'none';
        });
    });

    // -------------------------------------------------------------
    // 4. Clinical Services Tab Switcher
    // -------------------------------------------------------------
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Deactivate all buttons & panels
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            // Activate target
            btn.classList.add('active');
            const activePanel = document.getElementById(`tab-${targetTab}`);
            if (activePanel) {
                activePanel.classList.add('active');
            }
        });
    });

    // -------------------------------------------------------------
    // 5. Publications Search & Filter System
    // -------------------------------------------------------------
    const searchInput = document.getElementById('pub-search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const pubCards = document.querySelectorAll('.pub-card');
    let activeFilter = 'all';

    // Search input handler
    searchInput.addEventListener('input', filterPublications);

    // Filter button handlers
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-filter');
            filterPublications();
        });
    });

    function filterPublications() {
        const query = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        pubCards.forEach(card => {
            const cardTags = card.getAttribute('data-tags') || '';
            const cardContent = card.innerText.toLowerCase();

            // Matches filter tag?
            const matchesFilter = (activeFilter === 'all' || cardTags.split(',').includes(activeFilter));
            // Matches search query?
            const matchesSearch = (query === '' || cardContent.includes(query));

            if (matchesFilter && matchesSearch) {
                card.style.display = 'block';
                // Add fade-in animation
                card.style.animation = 'fadeInTab 0.3s ease-out';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Toggle Empty State message
        let emptyState = document.getElementById('pub-empty-state');
        if (visibleCount === 0) {
            if (!emptyState) {
                emptyState = document.createElement('div');
                emptyState.id = 'pub-empty-state';
                emptyState.style.padding = '40px 0';
                emptyState.style.textAlign = 'center';
                emptyState.style.color = 'var(--text-secondary)';
                emptyState.innerHTML = '<i data-lucide="alert-circle" style="width:32px;height:32px;margin-bottom:12px;color:var(--primary-color)"></i><p>No matching publications found. Try adjusting your search query.</p>';
                document.getElementById('pub-list-container').appendChild(emptyState);
                lucide.createIcons();
            } else {
                emptyState.style.display = 'block';
            }
        } else if (emptyState) {
            emptyState.style.display = 'none';
        }
    }

    // -------------------------------------------------------------
    // 6. Consultation/Contact Form Handling
    // -------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const contactSubmitBtn = document.getElementById('contact-submit-btn');
    const contactResponseAlert = document.getElementById('contact-form-response');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Form inputs
            const name = document.getElementById('contact-name').value;
            const phone = document.getElementById('contact-phone').value;
            const email = document.getElementById('contact-email').value;
            const subject = document.getElementById('contact-subject').value;
            const message = document.getElementById('contact-message').value;

            // Loading state
            contactSubmitBtn.disabled = true;
            contactSubmitBtn.innerHTML = 'Sending... <i data-lucide="loader" class="spin-icon"></i>';
            lucide.createIcons();

            contactResponseAlert.style.display = 'none';
            contactResponseAlert.className = 'form-response-alert';

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, phone, email, subject, message })
                });

                const data = await response.json();

                if (data.success) {
                    contactResponseAlert.classList.add('success');
                    contactResponseAlert.innerHTML = `Success! ${data.message || 'Your consultation request has been sent.'}`;
                    contactResponseAlert.style.display = 'block';
                    contactForm.reset();
                } else {
                    throw new Error(data.message || 'An error occurred.');
                }
            } catch (error) {
                contactResponseAlert.classList.add('error');
                contactResponseAlert.innerHTML = `Error: ${error.message || 'Failed to submit form. Please try again later.'}`;
                contactResponseAlert.style.display = 'block';
            } finally {
                contactSubmitBtn.disabled = false;
                contactSubmitBtn.innerHTML = 'Send Request <i data-lucide="send"></i>';
                lucide.createIcons();
            }
        });
    }

    // -------------------------------------------------------------
    // 7. Patient/Peer Feedback Guestbook Section
    // -------------------------------------------------------------
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackSubmitBtn = document.getElementById('feed-submit-btn');
    const reviewsListContainer = document.getElementById('reviews-list-container');

    // Local storage key for user delete tokens: { [reviewId]: deleteToken }
    const localTokensKey = 'review_delete_tokens';
    const getLocalTokens = () => JSON.parse(localStorage.getItem(localTokensKey) || '{}');
    const saveLocalToken = (reviewId, deleteToken) => {
        const tokens = getLocalTokens();
        tokens[reviewId] = deleteToken;
        localStorage.setItem(localTokensKey, JSON.stringify(tokens));
    };

    // Load reviews on page load
    fetchReviews();

    async function fetchReviews() {
        try {
            const response = await fetch('/api/feedback');
            const data = await response.json();
            
            if (data.success && data.reviews) {
                renderReviews(data.reviews);
            } else {
                throw new Error('Failed to load reviews.');
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            reviewsListContainer.innerHTML = '<div class="reviews-loading"><i data-lucide="alert-circle"></i> Error loading reviews.</div>';
            lucide.createIcons();
        }
    }

    function renderReviews(reviews) {
        if (!reviews || reviews.length === 0) {
            reviewsListContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No reviews yet. Be the first to leave feedback!</div>';
            return;
        }

        const userTokens = getLocalTokens();
        reviewsListContainer.innerHTML = '';

        reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card';
            reviewCard.id = `review-${review.id}`;

            const starString = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
            
            // Check if this user owns the review (has deletion token in localstorage)
            const canDelete = !!userTokens[review.id];
            const deleteBtnHtml = canDelete 
                ? `<button class="review-delete-btn" data-id="${review.id}" title="Delete this review"><i data-lucide="trash-2"></i></button>`
                : '';

            reviewCard.innerHTML = `
                <div class="review-header">
                    <div>
                        <div class="review-name">${review.name}</div>
                        <div class="review-date">${review.date || 'Just now'}</div>
                    </div>
                    <div class="review-stars">${starString}</div>
                </div>
                <p class="review-msg">${review.message}</p>
                ${deleteBtnHtml}
            `;

            reviewsListContainer.appendChild(reviewCard);
        });

        // Reinitialize lucide icons for trash bin etc
        lucide.createIcons();
        
        // Add event listeners to delete buttons
        const deleteButtons = reviewsListContainer.querySelectorAll('.review-delete-btn');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                deleteReview(id);
            });
        });
    }

    // -------------------------------------------------------------
    // Star Rating Selection Interactivity (Robust Event Delegation)
    // -------------------------------------------------------------
    const starsSelectContainer = document.getElementById('stars-select');
    const ratingInput = document.getElementById('feed-rating');

    if (starsSelectContainer && ratingInput) {
        // Helper to update active visual classes
        const updateFormStars = (val) => {
            const stars = starsSelectContainer.querySelectorAll('.rating-star');
            stars.forEach(star => {
                const starVal = parseInt(star.getAttribute('data-value'));
                if (starVal <= val) {
                    star.classList.add('active');
                } else {
                    star.classList.remove('active');
                }
            });
        };

        // Helper to update hover visual classes
        const highlightFormStars = (val) => {
            const stars = starsSelectContainer.querySelectorAll('.rating-star');
            stars.forEach(star => {
                const starVal = parseInt(star.getAttribute('data-value'));
                if (starVal <= val) {
                    star.classList.add('hovered');
                } else {
                    star.classList.remove('hovered');
                }
            });
        };

        // Initialize default state
        setTimeout(() => {
            updateFormStars(parseInt(ratingInput.value));
        }, 100);

        // Click handler via delegation
        starsSelectContainer.addEventListener('click', (e) => {
            const star = e.target.closest('.rating-star');
            if (star) {
                const selectedVal = parseInt(star.getAttribute('data-value'));
                ratingInput.value = selectedVal;
                updateFormStars(selectedVal);
            }
        });

        // Hover handler via delegation (mouseover to handle moving between stars)
        starsSelectContainer.addEventListener('mouseover', (e) => {
            const star = e.target.closest('.rating-star');
            if (star) {
                const hoverVal = parseInt(star.getAttribute('data-value'));
                highlightFormStars(hoverVal);
            }
        });

        // Mouse leave clears hover states and restores click value
        starsSelectContainer.addEventListener('mouseleave', () => {
            highlightFormStars(0);
            updateFormStars(parseInt(ratingInput.value));
        });

        // Expose updateFormStars globally or bind it to form reset
        window.resetFormStars = () => {
            updateFormStars(5);
        };
    }

    // Submit new review
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('feed-name').value;
            const rating = ratingInput ? ratingInput.value : 5;
            const message = document.getElementById('feed-message').value;

            // Loading state
            feedbackSubmitBtn.disabled = true;
            feedbackSubmitBtn.innerHTML = 'Submitting... <i data-lucide="loader" class="spin-icon"></i>';
            lucide.createIcons();

            try {
                const response = await fetch('/api/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, rating, message })
                });

                const data = await response.json();

                if (data.success) {
                    // Save deletion token if returned
                    if (data.newReview && data.newReview.deleteToken) {
                        saveLocalToken(data.newReview.id, data.newReview.deleteToken);
                    }
                    feedbackForm.reset();
                    if (ratingInput) {
                        ratingInput.value = 5;
                    }
                    if (typeof window.resetFormStars === 'function') {
                        window.resetFormStars();
                    }
                    // Re-render based on server returned list or fetch again
                    if (data.reviews) {
                        renderReviews(data.reviews);
                    } else {
                        fetchReviews();
                    }
                } else {
                    throw new Error(data.message || 'Could not submit review.');
                }
            } catch (error) {
                alert(`Error submitting feedback: ${error.message || 'Please try again later.'}`);
            } finally {
                feedbackSubmitBtn.disabled = false;
                feedbackSubmitBtn.innerHTML = 'Submit Review <i data-lucide="send"></i>';
                lucide.createIcons();
            }
        });
    }

    // Delete review
    async function deleteReview(id) {
        const tokens = getLocalTokens();
        const deleteToken = tokens[id];

        if (!deleteToken) {
            alert('Cannot delete review: ownership token missing.');
            return;
        }

        if (!confirm('Are you sure you want to delete your review?')) {
            return;
        }

        try {
            const response = await fetch('/api/feedback', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, deleteToken })
            });

            const data = await response.json();

            if (data.success) {
                // Delete from local tokens storage
                const localTokens = getLocalTokens();
                delete localTokens[id];
                localStorage.setItem(localTokensKey, JSON.stringify(localTokens));

                // Re-render
                if (data.reviews) {
                    renderReviews(data.reviews);
                } else {
                    fetchReviews();
                }
            } else {
                throw new Error(data.message || 'Could not delete review.');
            }
        } catch (error) {
            alert(`Error deleting review: ${error.message}`);
        }
    }
});
