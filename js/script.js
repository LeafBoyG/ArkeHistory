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
        const header = document.querySelector('.main-header'); // Not directly used in toggle but often involved with styling

        if (!navToggle || !mainNav || !header) return;

        navToggle.addEventListener('click', () => {
            const isActive = mainNav.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isActive);
            document.body.classList.toggle('no-scroll', isActive); // Prevent scrolling when nav is open
        });

        // Close nav when a link is clicked
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

        // Normalize paths for comparison (e.g., /index.html and / become /)
        if (currentPath === '/index.html' || currentPath === '/index.htm') currentPath = '/';
        // For GitHub Pages project sites, the base URL includes the repo name.
        // We need to account for this when comparing paths.
        // Example: If repo is 'ArkeHistory', then actual path might be '/ArkeHistory/index.html'
        const repoName = 'ArkeHistory'; // Replace with your actual repository name
        if (currentPath.startsWith(`/${repoName}/`)) {
            currentPath = currentPath.substring(`/${repoName}/`.length -1); // Keep leading slash for consistency
             if (currentPath === '/') currentPath = '/index.html'; // Default to index.html if it's the root of the repo
        }
        if (currentPath === '/index.html' || currentPath === '/index.htm') currentPath = '/';


        navLinks.forEach(link => {
            let linkPath = new URL(link.href).pathname;
            // Normalize link paths as well
            if (linkPath === '/index.html' || linkPath === '/index.htm') linkPath = '/';
             if (linkPath.startsWith(`/${repoName}/`)) {
                 linkPath = linkPath.substring(`/${repoName}/`.length -1);
                 if (linkPath === '/') linkPath = '/index.html';
             }
             if (linkPath === '/index.html' || linkPath === '/index.htm') linkPath = '/';


            // Check for exact match OR if current page is within the linked category (e.g., /article/the-dawn-of-civilization.html matches /eras.html or /topics.html)
            const segmentsCurrent = currentPath.split('/').filter(Boolean);
            const segmentsLink = linkPath.split('/').filter(Boolean);

            let isActive = false;

            // Exact match
            if (currentPath === linkPath) {
                isActive = true;
            } else if (segmentsCurrent.length > 1) {
                // Handle nested structures like /article/some-article.html
                // Check if the current page's first segment matches a link's category
                // E.g., if linkPath is /eras.html and currentPath is /article/some-era-article.html
                if (segmentsLink.length > 0) {
                    const linkCategory = segmentsLink[0].replace('.html', ''); // 'eras' or 'topics'
                    if (currentPath.includes(`/${linkCategory}/`)) {
                        isActive = true;
                    }
                }
            }
            
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
            header.classList.toggle('scrolled', window.scrollY > 50); // Add 'scrolled' class after 50px scroll
        });
    };

    /**
     * Creates and manages a scroll-to-top button.
     */
    const setupScrollToTopButton = () => {
        const scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.innerHTML = '&#8593;'; // Up arrow
        scrollToTopBtn.className = 'scroll-to-top'; // CSS class for styling
        scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
        document.body.appendChild(scrollToTopBtn);

        window.addEventListener('scroll', () => {
            scrollToTopBtn.classList.toggle('show', window.scrollY > 300); // Show after 300px scroll
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top
        });
    };

    /**
     * Creates and manages a reading progress bar.
     */
    const setupReadingProgressBar = () => {
        // You would need to add a div with class="reading-progress-bar" to your HTML, e.g., right after <body>
        const progressBar = document.querySelector('.reading-progress-bar');
        if (!progressBar) return; // Only run if the element exists

        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            progressBar.style.width = `${scrollProgress}%`;
        });
    };

    // --- 2. CONTENT FEATURES ---

    /**
     * Dynamically creates accessible tooltips for defined terms, now with optional images.
     * Requires elements with class="tooltip" and:
     * - data-tooltip-description="Your tooltip text."
     * - data-tooltip-image="path/to/image.jpg" (optional)
     * OR
     * - data-tooltip="Your tooltip text." (for text-only tooltips)
     */
    const setupTooltips = () => {
        const tooltips = document.querySelectorAll('.tooltip');
        if (!tooltips.length) return;

        tooltips.forEach((tooltip, index) => {
            // Check for new attributes first
            const descriptionText = tooltip.dataset.tooltipDescription;
            const imageUrl = tooltip.dataset.tooltipImage;

            // Fallback to old data-tooltip if new ones aren't present (for existing text-only tooltips)
            const oldTooltipText = tooltip.dataset.tooltip; 
            const finalDescription = descriptionText || oldTooltipText; // Prefer new, fallback to old

            if (!finalDescription && !imageUrl) return; // Skip if no content

            // Set up accessibility attributes
            tooltip.setAttribute('tabindex', '0');
            tooltip.setAttribute('aria-describedby', `tooltip-${index}`);

            const box = document.createElement('div');
            box.className = 'tooltip-box';
            box.setAttribute('role', 'tooltip');
            box.setAttribute('id', `tooltip-${index}`);

            if (imageUrl) {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = tooltip.textContent + ' portrait'; // Alt text for accessibility
                img.className = 'tooltip-image'; // For styling
                box.appendChild(img);
            }

            if (finalDescription) { // Use finalDescription
                const p = document.createElement('p');
                p.textContent = finalDescription;
                box.appendChild(p);
            }
            
            tooltip.appendChild(box);
        });
    };

    /**
     * Sets up social media sharing links and copy-to-clipboard functionality.
     * Requires a container with class="social-share" and buttons with specific classes (e.g., .share-btn.twitter).
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
                    // Provide visual feedback for copy success
                    copyBtn.textContent = 'Copied!';
                    copyBtn.classList.add('copy-link-success');
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy Link';
                        copyBtn.classList.remove('copy-link-success');
                    }, 2000); // Reset text after 2 seconds
                }).catch(err => console.error('Failed to copy: ', err));
            });
        }
    };

    /**
     * Sets up a light/dark theme toggler with localStorage persistence.
     * Requires a button with class="theme-toggle".
     */
    const setupThemeToggler = () => {
        const themeToggleBtn = document.querySelector('.theme-toggle');
        if (!themeToggleBtn) return;

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const saved = localStorage.getItem('theme'); // Get saved theme from localStorage
        const initial = saved || (prefersDark ? 'dark' : 'light'); // Default to system preference if no saved theme

        const setTheme = (theme) => {
            document.documentElement.classList.toggle('dark-mode', theme === 'dark');
            themeToggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
            localStorage.setItem('theme', theme); // Save current theme
        };

        // Apply initial theme
        setTheme(initial);

        themeToggleBtn.addEventListener('click', () => {
            const current = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
            setTheme(current === 'dark' ? 'light' : 'dark'); // Toggle theme
        });
    };

    /**
     * Adds a fade-in effect to elements with class "js-fade-in" as they scroll into view.
     * Elements should initially have opacity: 0 and transform: translateY(20px) etc., in CSS.
     */
    const animateOnScroll = () => {
        const sections = document.querySelectorAll('.js-fade-in');
        if (!sections.length) return;

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible'); // Trigger CSS animation
                    observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

        sections.forEach(el => observer.observe(el));
    };

    /**
     * Lazy loads images by swapping a data-src attribute into the src attribute.
     * Requires images with class="lazy" and data-src="path/to/image.jpg".
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

                    img.src = realSrc; // Load the image

                    img.addEventListener('load', () => {
                        img.classList.remove('lazy'); // Remove lazy class
                        img.classList.add('lazy-loaded'); // Add loaded class for fade-in effect
                    });

                    observer.unobserve(img); // Stop observing once loaded
                }
            });
        }, {
            rootMargin: '100px', // Start loading when image is 100px away from viewport
            threshold: 0.1
        });

        lazyImages.forEach(img => lazyObserver.observe(img));
    };
    
    /**
     * Animates the hero year with a slot-machine effect.
     * Requires an element with id="rolling-year" inside a container with class="animation-container" and data-target-year attribute.
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
        // Determine the starting year for the animation. If target is BCE and further back than current year, start from 0.
        // Otherwise, if target is AD and current year is greater, start from current year.
        const startYear = (targetYear < 0 && Math.abs(targetYear) > currentYear) ? 0 : currentYear; 
        
        const animationDuration = 5000; // Increased to 5 seconds (from 3000ms) for a longer animation.
        const frameRate = 60; // Frames per second
        const totalFrames = (animationDuration / 1000) * frameRate;
        const targetStr = Math.abs(targetYear).toString(); // Convert target year to string for digit processing
        
        // Build digit slots HTML dynamically
        rollingYearSpan.innerHTML = ''; // Clear existing content
        for (let i = 0; i < targetStr.length; i++) {
            const slot = document.createElement('div');
            slot.className = 'digit-slot';
            const strip = document.createElement('div');
            strip.className = 'digit-strip';
            // Add digits 0-9 to the strip
            for (let d = 0; d <= 9; d++) {
                const span = document.createElement('span');
                span.textContent = d;
                strip.appendChild(span);
            }
            slot.appendChild(strip);
            rollingYearSpan.appendChild(slot);
        }
        // Add BCE label if target year is BC
        if (targetYear < 0) {
            const bceSpan = document.createElement('span');
            bceSpan.className = 'bce-label';
            bceSpan.textContent = ' BCE';
            rollingYearSpan.appendChild(bceSpan);
        }

        let digitHeight = 0; // Initialize digitHeight here

        // This function will be called once we are sure `digitHeight` is correctly set.
        const startRollingAnimation = () => {
            // Re-check digitHeight right before starting, just in case
            const firstDigitSpan = rollingYearSpan.querySelector('.digit-slot span');
            if (firstDigitSpan) {
                digitHeight = firstDigitSpan.offsetHeight;
            }

            if (digitHeight === 0) {
                console.error('Year Rollback Animation: digitHeight is 0. Animation aborted. Check CSS or DOM readiness.');
                // Fallback to static display if height cannot be determined
                rollingYearSpan.innerHTML = `${Math.abs(targetYear)}${targetYear < 0 ? ' BCE' : ''}`;
                return;
            }
            
            const digitSlots = rollingYearSpan.querySelectorAll('.digit-slot');
            if (digitSlots.length === 0) {
                console.warn('Year Rollback Animation: Digit slots not found after creation. HTML structure or JS insertion issue.');
                rollingYearSpan.innerHTML = `${Math.abs(targetYear)}${targetYear < 0 ? ' BCE' : ''}`;
                return;
            }

            let frame = 0;
            const rollFrame = () => {
                if (frame < totalFrames) {
                    frame++;
                    let progress = frame / totalFrames;
                    // Easing function (ease-in-out cubic)
                    let easedProgress = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                    
                    let animatedYearNum;
                    if (targetYear < 0) {
                        // For BCE years, count down from startYear (current year) towards the negative target
                        animatedYearNum = Math.round(startYear + (targetYear - startYear) * easedProgress);
                    } else {
                        // For AD years, count down from startYear (current year) towards the target
                        animatedYearNum = Math.round(startYear - (startYear - targetYear) * easedProgress);
                    }
                    
                    const currentAnimatedStr = Math.abs(animatedYearNum).toString(); // Get string representation of current animated number
                    
                    digitSlots.forEach((slot, i) => {
                        const strip = slot.querySelector('.digit-strip');
                        let displayDigit = 0;

                        // Determine the digit to display for the current slot
                        if (i < currentAnimatedStr.length) {
                             displayDigit = parseInt(currentAnimatedStr[i], 10);
                        } else if (i < targetStr.length) {
                            // If animated number is shorter than target, fill leading zeros with '0'
                            displayDigit = 0; 
                        }

                        // Apply transform to scroll the digit strip
                        const targetTransformY = digitHeight * displayDigit;
                        strip.style.transform = `translateY(-${targetTransformY}px)`;
                    });
                    
                    // Control BCE label visibility based on animated year sign
                    if (targetYear < 0) {
                        const bceLabel = rollingYearSpan.querySelector('.bce-label');
                        if (bceLabel) bceLabel.style.opacity = (animatedYearNum < 0) ? 1 : 0;
                    }
                    
                    requestAnimationFrame(rollFrame); // Continue animation
                } else {
                    // Snap to final state to ensure perfect alignment
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
            rollFrame(); // Start the animation loop
        };

        // Use IntersectionObserver to trigger the animation when the container is visible
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        startRollingAnimation(); 
                    }, 300); // Give a slightly longer delay (e.g., 300ms) to ensure elements are fully rendered

                    observerInstance.unobserve(animationContainer); // Stop observing once triggered
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% of the container is visible

        observer.observe(animationContainer); // Start observing the animation container
    };

    /**
     * Updates the copyright year in the footer.
     */
    const setupCopyrightYear = () => {
        const copyrightSpan = document.querySelector('.copyright-year'); // Assuming you have a span with this class in your footer
        if (copyrightSpan) {
            const currentYear = new Date().getFullYear();
            // This is a more robust way to set the copyright text, handling both initial state and update.
            copyrightSpan.textContent = `© ${currentYear} Arke. All rights reserved.`;
        }
    };

    // --- INITIALIZE ALL FEATURES ---
    setupMobileNav();
    highlightNavLink();
    setupStickyHeader();
    setupScrollToTopButton();
    setupReadingProgressBar(); // Make sure you have the .reading-progress-bar element in your HTML
    setupTooltips(); // Make sure you have .tooltip elements with data-tooltip attributes
    setupSocialSharing(); // Make sure you have .social-share container and share buttons
    setupThemeToggler(); // Make sure you have a .theme-toggle button
    animateOnScroll();
    setupLazyLoading(); // Make sure you have img.lazy with data-src attributes
    setupYearRollbackAnimation(); // Make sure you have .animation-container with data-target-year and #rolling-year
    setupCopyrightYear();
});