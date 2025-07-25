document.addEventListener('DOMContentLoaded', () => {

    // --- Global Utility Functions ---

    /**
     * Smooth scrolls to an element.
     * @param {HTMLElement} targetElement The element to scroll to.
     */
    const smoothScroll = (targetElement) => {
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - (document.querySelector('.main-header')?.offsetHeight || 0),
                behavior: 'smooth'
            });
        }
    };

    // --- 1. HEADER & NAVIGATION ENHANCEMENTS ---

    /**
     * Toggles the mobile navigation menu.
     */
    const setupMobileNav = () => {
        const navToggle = document.querySelector('.nav-toggle');
        const mainNav = document.querySelector('.main-nav');
        const header = document.querySelector('.main-header');

        if (!navToggle || !mainNav || !header) return;

        navToggle.addEventListener('click', () => {
            const isActive = mainNav.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isActive);
            document.body.classList.toggle('no-scroll', isActive);
        });

        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('no-scroll');
                }
            });
        });
    };

    /**
     * Adds an 'active' class to the navigation link of the current page.
     */
    const highlightNavLink = () => {
        let currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.main-nav ul li a');

        // Normalize paths (e.g., /index.html and / become /)
        if (currentPath === '/index.html' || currentPath === '/index.htm') currentPath = '/';

        navLinks.forEach(link => {
            let linkPath = new URL(link.href).pathname;
            if (linkPath === '/index.html' || linkPath === '/index.htm') linkPath = '/';

            // Check for exact match OR if current page is within the linked category (e.g., /article/topics/ matches /topics.html)
            const segmentsCurrent = currentPath.split('/').filter(Boolean);
            const segmentsLink = linkPath.split('/').filter(Boolean);

            const isActive = currentPath === linkPath || // Exact match
                             (segmentsCurrent.length > 1 && segmentsLink.length > 0 && // Nested article like /article/topics/
                              segmentsCurrent[0] === 'article' && segmentsCurrent[1] === segmentsLink[0] &&
                              linkPath === `/${segmentsLink[0]}.html`); // Link points to parent category

            link.classList.toggle('active', isActive);
        });
    };

    /**
     * Adds a 'scrolled' class to the header on scroll.
     */
    const setupStickyHeader = () => {
        const header = document.querySelector('.main-header');
        if (!header) return;
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    };

    /**
     * Creates and manages a scroll-to-top button.
     */
    const setupScrollToTopButton = () => {
        const scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.innerHTML = '&#8593;';
        scrollToTopBtn.className = 'scroll-to-top';
        scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
        document.body.appendChild(scrollToTopBtn);

        window.addEventListener('scroll', () => {
            scrollToTopBtn.classList.toggle('show', window.scrollY > 300);
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };

    /**
     * Creates and manages a reading progress bar.
     */
    const setupReadingProgressBar = () => {
        const progressBar = document.querySelector('.reading-progress-bar');
        if (!progressBar) return;
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            progressBar.style.width = `${scrollProgress}%`;
        });
    };

    // --- 2. CONTENT FEATURES ---

    /**
     * Dynamically creates accessible tooltips for defined terms.
     */
    const setupTooltips = () => {
        const tooltips = document.querySelectorAll('.tooltip');
        if (!tooltips.length) return;

        tooltips.forEach((tooltip, index) => {
            const text = tooltip.dataset.tooltip;
            if (!text) return;
            tooltip.setAttribute('tabindex', '0');
            tooltip.setAttribute('aria-describedby', `tooltip-${index}`);
            const box = document.createElement('div');
            box.className = 'tooltip-box';
            box.setAttribute('role', 'tooltip');
            box.setAttribute('id', `tooltip-${index}`);
            box.textContent = text;
            tooltip.appendChild(box);
        });
    };

    /**
     * Sets up social media sharing links and copy-to-clipboard functionality.
     */
    const setupSocialSharing = () => {
        const shareContainer = document.querySelector('.social-share');
        if (!shareContainer) return;

        const pageUrl = encodeURIComponent(window.location.href);
        const pageTitle = encodeURIComponent(document.title);

        const twitterBtn = shareContainer.querySelector('.share-btn.twitter');
        const facebookBtn = shareContainer.querySelector('.share-btn.facebook');
        const copyBtn = shareContainer.querySelector('.share-btn.copy-link');

        if (twitterBtn) { twitterBtn.href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`; }
        if (facebookBtn) { facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`; }
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(decodeURIComponent(pageUrl)).then(() => {
                    copyBtn.textContent = 'Copied!';
                    copyBtn.classList.add('copy-link-success');
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy Link';
                        copyBtn.classList.remove('copy-link-success');
                    }, 2000);
                }).catch(err => console.error('Failed to copy: ', err));
            });
        }
    };

    /**
     * Sets up a light/dark theme toggler with localStorage persistence.
     */
    const setupThemeToggler = () => {
        const themeToggleBtn = document.querySelector('.theme-toggle');
        if (!themeToggleBtn) return;

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const saved = localStorage.getItem('theme');
        const initial = saved || (prefersDark ? 'dark' : 'light');

        const setTheme = (theme) => {
            document.documentElement.classList.toggle('dark-mode', theme === 'dark');
            themeToggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
            localStorage.setItem('theme', theme);
        };

        setTheme(initial);

        themeToggleBtn.addEventListener('click', () => {
            const current = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    };

    /**
     * Adds a fade-in effect to elements as they scroll into view.
     */
    const animateOnScroll = () => {
        const sections = document.querySelectorAll('.js-fade-in');
        if (!sections.length) return;

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(el => observer.observe(el));
    };

    /**
     * Lazy loads images by swapping a data-src attribute into the src attribute.
     */
    const setupLazyLoading = () => {
        const lazyImages = document.querySelectorAll('img.lazy[data-src]');
        if (!lazyImages.length) return;

        const lazyObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const realSrc = img.dataset.src;
                    if (!realSrc) return;

                    img.src = realSrc;

                    img.addEventListener('load', () => {
                        img.classList.remove('lazy');
                        img.classList.add('lazy-loaded');
                    });

                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '100px',
            threshold: 0.1
        });

        lazyImages.forEach(img => lazyObserver.observe(img));
    };
    
    /**
     * Animates the hero year with a slot-machine effect.
     */
    const setupYearRollbackAnimation = () => {
        const animationContainer = document.querySelector('.animation-container');
        const rollingYearSpan = document.getElementById('rolling-year');
        
        // Ensure animation container and span exist on the page
        if (!animationContainer || !rollingYearSpan) return;
        
        const targetYear = parseInt(animationContainer.dataset.targetYear, 10);
        if (isNaN(targetYear)) {
            console.warn('Year Rollback Animation: data-target-year is missing or invalid on .animation-container.');
            rollingYearSpan.textContent = "N/A"; // Display fallback
            return;
        }

        const currentYear = new Date().getFullYear();
        const startYear = (targetYear < 0 && Math.abs(targetYear) > currentYear) ? 0 : currentYear;
        const animationDuration = 3000;
        const frameRate = 60;
        const totalFrames = (animationDuration / 1000) * frameRate;
        const targetStr = Math.abs(targetYear).toString();
        
        // Build digit slots HTML
        rollingYearSpan.innerHTML = '';
        for (let i = 0; i < targetStr.length; i++) {
            const slot = document.createElement('div');
            slot.className = 'digit-slot';
            const strip = document.createElement('div');
            strip.className = 'digit-strip';
            for (let d = 0; d <= 9; d++) {
                const span = document.createElement('span');
                span.textContent = d;
                strip.appendChild(span);
            }
            slot.appendChild(strip);
            rollingYearSpan.appendChild(slot);
        }
        if (targetYear < 0) {
            const bceSpan = document.createElement('span');
            bceSpan.className = 'bce-label';
            bceSpan.textContent = ' BCE';
            rollingYearSpan.appendChild(bceSpan);
        }

        const animateDigits = () => {
            const digitSlots = rollingYearSpan.querySelectorAll('.digit-slot');
            if (digitSlots.length === 0) {
                console.warn('Year Rollback Animation: Digit slots not found after creation. HTML structure or JS insertion issue.');
                rollingYearSpan.innerHTML = `${Math.abs(targetYear)}${targetYear < 0 ? ' BCE' : ''}`;
                return;
            }
            const digitHeight = digitSlots[0].querySelector('span')?.offsetHeight || 0;
            if (digitHeight === 0) {
                console.warn('Year Rollback Animation: Digit height is 0, cannot animate. Check CSS for .digit-slot span and its parents (font-size, line-height, display).');
                rollingYearSpan.innerHTML = `${Math.abs(targetYear)}${targetYear < 0 ? ' BCE' : ''}`;
                return;
            }
            
            let frame = 0;
            const rollFrame = () => {
                if (frame < totalFrames) {
                    frame++;
                    let progress = frame / totalFrames;
                    let easedProgress = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                    
                    let animatedYearNum;
                    if (targetYear < 0) {
                        animatedYearNum = Math.round(startYear + (targetYear - startYear) * easedProgress);
                    } else {
                        animatedYearNum = Math.round(startYear - (startYear - targetYear) * easedProgress);
                    }
                    
                    const currentAnimatedStr = Math.abs(animatedYearNum).toString();
                    
                    digitSlots.forEach((slot, i) => {
                        const strip = slot.querySelector('.digit-strip');
                        let displayDigit = 0;

                        if (i < currentAnimatedStr.length) {
                             displayDigit = parseInt(currentAnimatedStr[i], 10);
                        } else if (i < targetStr.length) {
                            displayDigit = 0;
                        }

                        const targetTransformY = digitHeight * displayDigit;
                        strip.style.transform = `translateY(-${targetTransformY}px)`;
                    });
                    
                    if (targetYear < 0) {
                        const bceLabel = rollingYearSpan.querySelector('.bce-label');
                        if (bceLabel) bceLabel.style.opacity = (animatedYearNum < 0) ? 1 : 0;
                    }
                    
                    requestAnimationFrame(rollFrame);
                } else {
                    // Snap to final state
                    digitSlots.forEach((slot, i) => {
                        const strip = slot.querySelector('.digit-strip');
                        const finalDigit = parseInt(targetStr[i], 10);
                        const finalTransformY = digitHeight * finalDigit;
                        strip.style.transform = `translateY(-${finalTransformY}px)`;
                    });
                    if (targetYear < 0) {
                        const bceLabel = rollingYearSpan.querySelector('.bce-label');
                        if (bceLabel) bceLabel.style.opacity = 1;
                    }
                }
            };
            rollFrame();
        };

        // Primary trigger for the year animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target.classList.contains('is-visible')) {
                    setTimeout(animateDigits, 600); // Wait for the .js-fade-in transition (0.6s) plus a small buffer
                    observer.unobserve(animationContainer);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(animationContainer);
    };

    /**
     * Updates the copyright year in the footer.
     */
    const setupCopyrightYear = () => {
        const copyrightSpan = document.querySelector('.copyright-year');
        if (copyrightSpan) {
            if (copyrightSpan.textContent.includes('2025')) {
                copyrightSpan.textContent = copyrightSpan.textContent.replace('2025', new Date().getFullYear());
            } else {
                copyrightSpan.textContent = `© ${new Date().getFullYear()} Arke. All rights reserved.`;
            }
        }
    };

    // --- INITIALIZE ALL FEATURES ---
    setupMobileNav();
    highlightNavLink();
    setupStickyHeader();
    setupScrollToTopButton();
    setupReadingProgressBar();
    setupTooltips();
    setupSocialSharing();
    setupThemeToggler();
    animateOnScroll();
    setupLazyLoading();
    setupYearRollbackAnimation();
    setupCopyrightYear();
});