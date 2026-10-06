// GLOBAL SOUND MANAGER (Web Audio API Synth)
let audioCtx = null;
let isMuted = false;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTone(freq, type, duration, slideTo = 0) {
    if (isMuted) return;
    initAudio();
    if (!audioCtx) return;

    try {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        
        if (slideTo > 0) {
            osc.frequency.exponentialRampToValueAtTime(slideTo, audioCtx.currentTime + duration);
        }

        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.warn("Audio synthesis error:", e);
    }
}

function playHoverSound() { playTone(1000, 'sine', 0.05, 1400); }
function playClickSound() { playTone(600, 'triangle', 0.12, 1000); }
function playSuccessSound() {
    playTone(800, 'sine', 0.1, 1200);
    setTimeout(() => playTone(1200, 'sine', 0.2, 1600), 100);
}
function playChimeSound() { playTone(1500, 'sine', 0.4, 200); }

// TOAST NOTIFICATION MANAGER
window.showToast = function(message, icon = 'fa-circle-check') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastIn 0.3s reverse ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2400);
};

// LIGHTBOX IMAGE VIEWER
window.openLightbox = function(imgSrc, caption = '') {
    const lightbox = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    if (lightbox && lightboxImg) {
        lightboxImg.src = imgSrc;
        if (lightboxCaption) lightboxCaption.innerText = caption || 'High-Resolution Design View';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (typeof playChimeSound === 'function') playChimeSound();
    }
};

// TOP LEVEL CURSOR TRACKING (Runs immediately)
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let dotX = mouseX;
let dotY = mouseY;
let glowX = mouseX;
let glowY = mouseY;

const updateMousePos = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
};

window.addEventListener('mousemove', updateMousePos, { passive: true });
window.addEventListener('pointermove', updateMousePos, { passive: true });

function animateCursor() {
    const cursorDot = document.getElementById('cursorDot');
    const cursorGlow = document.getElementById('cursorGlow');

    const dotSpeed = 0.5;
    const glowSpeed = 0.2;

    dotX += (mouseX - dotX) * dotSpeed;
    dotY += (mouseY - dotY) * dotSpeed;
    glowX += (mouseX - glowX) * glowSpeed;
    glowY += (mouseY - glowY) * glowSpeed;

    if (cursorDot) {
        cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    }
    if (cursorGlow) {
        cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
    }

    requestAnimationFrame(animateCursor);
}
requestAnimationFrame(animateCursor);

// MAIN DOM LOADED EVENT
document.addEventListener('DOMContentLoaded', () => {

    // SFX Toggle
    const sfxToggle = document.getElementById('sfxToggle');
    if (sfxToggle) {
        sfxToggle.addEventListener('click', () => {
            isMuted = !isMuted;
            const icon = sfxToggle.querySelector('i');
            if (isMuted) {
                icon.className = 'fa-solid fa-volume-xmark';
                sfxToggle.title = 'SFX Muted';
            } else {
                icon.className = 'fa-solid fa-volume-high';
                sfxToggle.title = 'SFX Active';
                initAudio();
                playTone(800, 'sine', 0.08);
            }
        });
    }

    // Global Event Delegation for Glass Cursor Hover States & Audio Tones
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('a, button, .floating-card, .sim-app-btn, .magnetic-tag, .project-card, .timeline-card, .swatch-chip, .variant-chip, .sticky-note, canvas, input, textarea, [role="button"]');
        if (target) {
            document.body.classList.add('cursor-hovering');
        }
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('a, button, .floating-card, .sim-app-btn, .magnetic-tag, .project-card, .timeline-card, .swatch-chip, .variant-chip, .sticky-note, canvas, input, textarea, [role="button"]');
        if (target) {
            document.body.classList.remove('cursor-hovering');
        }
    });

    // Glass Cursor Ripple Effect
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button, .floating-card, .sim-app-btn, .magnetic-tag, .project-card, .timeline-card, .swatch-chip, .variant-chip, .sticky-note, canvas, [role="button"]');
        if (target && typeof playClickSound === 'function') {
            playClickSound();
        }
        const ripple = document.createElement('div');
        ripple.className = 'cursor-click-ripple';
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
    });

    // Lightbox Modal Close Handlers
    const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
    const lightboxModal = document.getElementById('lightboxModal');
    if (lightboxCloseBtn && lightboxModal) {
        const closeLightbox = () => {
            lightboxModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        };
        lightboxCloseBtn.addEventListener('click', closeLightbox);
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightboxModal.classList.contains('active')) closeLightbox();
        });
    }

    // Floating Hero Cards Lightbox Trigger
    const floatingHeroCards = document.querySelectorAll('.floating-card');
    floatingHeroCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            const img = card.querySelector('img');
            const tag = card.querySelector('.card-tag, .card-caption');
            if (img) {
                openLightbox(img.src, tag ? tag.innerText : 'Hero Design Feature');
            }
        });
    });

    // Hero Parallax System
    const hero = document.getElementById('home');
    const cards = document.querySelectorAll('.floating-card');
    const heroWords = document.querySelectorAll('.hero-word');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const xVal = (e.clientX / width) - 0.5;
            const yVal = (e.clientY / height) - 0.5;

            cards.forEach(card => {
                const depth = parseFloat(card.getAttribute('data-depth')) || 0.1;
                const xMove = xVal * width * depth;
                const yMove = yVal * height * depth;
                const tiltX = -yVal * 15;
                const tiltY = xVal * 15;
                card.style.transform = `translate3d(${xMove}px, ${yMove}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
            });

            heroWords.forEach((word, index) => {
                const depth = (index + 1) * 0.03;
                const xMove = -xVal * width * depth;
                const yMove = -yVal * height * depth;
                word.style.transform = `translate(${xMove}px, ${yMove}px)`;
            });
        });

        hero.addEventListener('mouseleave', () => {
            cards.forEach(card => {
                card.style.transform = 'translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg)';
                card.style.transition = 'transform 0.8s ease-out';
            });
            heroWords.forEach(word => {
                word.style.transform = 'translate(0px, 0px)';
                word.style.transition = 'transform 0.8s ease-out';
            });
        });

        hero.addEventListener('mouseenter', () => {
            cards.forEach(card => { card.style.transition = 'none'; });
            heroWords.forEach(word => { word.style.transition = 'none'; });
        });
    }

    // Before/After Slider Widget
    const slider = document.getElementById('sliderRange');
    const afterLayer = document.getElementById('afterImageLayer');
    const handle = document.getElementById('sliderHandle');
    if (slider && afterLayer && handle) {
        slider.addEventListener('input', (e) => {
            const val = e.target.value;
            afterLayer.style.width = `${val}%`;
            handle.style.left = `${val}%`;
        });
    }

    // HTML5 Scratch Card Canvas
    const canvas = document.getElementById('scratchCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let isDrawing = false;

        function initScratchCanvas() {
            ctx.fillStyle = '#221a35';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = '800 14px Outfit';
            ctx.fillStyle = '#8a2be2';
            ctx.textAlign = 'center';
            ctx.fillText('SCRATCH WITH CURSOR', canvas.width / 2, canvas.height / 2 - 10);
            ctx.font = '500 11px Inter';
            ctx.fillStyle = '#a278ed';
            ctx.fillText('TO REVEAL ACHIEVEMENT', canvas.width / 2, canvas.height / 2 + 15);
            ctx.strokeStyle = 'rgba(162, 120, 237, 0.3)';
            ctx.lineWidth = 2;
            ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        }
        initScratchCanvas();

        function getMousePos(e) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) * (canvas.width / rect.width),
                y: (clientY - rect.top) * (canvas.height / rect.height)
            };
        }

        function scratch(e) {
            if (!isDrawing) return;
            const pos = getMousePos(e);
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
            ctx.fill();
        }

        canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
        canvas.addEventListener('mousemove', scratch);
        window.addEventListener('mouseup', () => { isDrawing = false; });
        canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); });
        canvas.addEventListener('touchmove', scratch);
        window.addEventListener('touchend', () => { isDrawing = false; });
    }

    // Phone Simulator
    const simButtons = document.querySelectorAll('.sim-app-btn');
    const screenImg = document.getElementById('phoneScreenImg');
    simButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            simButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const newImg = btn.getAttribute('data-img');
            if (screenImg) {
                screenImg.style.opacity = '0';
                screenImg.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    screenImg.src = newImg;
                    screenImg.style.opacity = '1';
                }, 300);
            }
        });
    });

    // Magnetic Skill Badges
    const magneticContainer = document.getElementById('magneticContainer');
    const tags = document.querySelectorAll('.magnetic-tag');
    if (magneticContainer) {
        magneticContainer.addEventListener('mousemove', (e) => {
            const containerRect = magneticContainer.getBoundingClientRect();
            const mX = e.clientX - containerRect.left;
            const mY = e.clientY - containerRect.top;

            tags.forEach(tag => {
                const tagRect = tag.getBoundingClientRect();
                const tagX = (tagRect.left - containerRect.left) + tagRect.width / 2;
                const tagY = (tagRect.top - containerRect.top) + tagRect.height / 2;
                const distanceX = mX - tagX;
                const distanceY = mY - tagY;
                const distance = Math.hypot(distanceX, distanceY);

                if (distance < 90) {
                    const attractionPower = (90 - distance) / 90;
                    const pullX = distanceX * attractionPower * 0.45;
                    const pullY = distanceY * attractionPower * 0.45;
                    tag.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`;
                } else {
                    tag.style.transform = 'translate3d(0, 0, 0)';
                }
            });
        });

        magneticContainer.addEventListener('mouseleave', () => {
            tags.forEach(tag => {
                tag.style.transform = 'translate3d(0, 0, 0)';
                tag.style.transition = 'transform 0.5s ease-out';
            });
        });
    }

    // Gravity Physics Override Easter Egg
    const physicsBtn = document.getElementById('physicsBtn');
    if (physicsBtn) {
        physicsBtn.addEventListener('click', () => {
            const isActive = document.body.classList.toggle('override-physics-mode');
            physicsBtn.classList.toggle('active');
            const btnSpan = physicsBtn.querySelector('span');
            if (isActive) {
                if (btnSpan) btnSpan.innerText = 'RESTORE GRAVITY';
                playChimeSound();
                showToast('Gravity Override Active!', 'fa-globe');
            } else {
                if (btnSpan) btnSpan.innerText = 'OVERRIDE GRAVITY';
                playTone(400, 'sine', 0.2);
                showToast('Gravity Restored', 'fa-globe');
            }
        });
    }

    // Work / Project Category Filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCardsList = document.querySelectorAll('.project-card');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');
            projectCardsList.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
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

    // Timeline Expand Cards
    const timelineCards = document.querySelectorAll('.timeline-card');
    timelineCards.forEach(card => {
        card.addEventListener('click', () => { card.classList.toggle('expanded'); });
    });

    // Contact Form AJAX Submit
    const contactForm = document.getElementById('contactForm');
    const successOverlay = document.getElementById('formSuccess');
    const resetFormBtn = document.getElementById('resetFormBtn');
    const submitFormBtn = document.getElementById('submitFormBtn');

    if (contactForm && successOverlay) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (submitFormBtn) {
                submitFormBtn.disabled = true;
                const btnText = submitFormBtn.querySelector('span');
                if (btnText) btnText.innerText = 'TRANSMITTING...';
            }
            const formData = new FormData(contactForm);
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            })
            .then(async (response) => {
                const result = await response.json();
                if (response.status === 200 || result.success) {
                    playSuccessSound();
                    successOverlay.classList.add('active');
                    showToast('Message Sent Successfully!', 'fa-circle-check');
                } else {
                    alert(result.message || "Submission error. Check Web3Forms key.");
                }
            })
            .catch(() => alert("Network error. Please try again."))
            .finally(() => {
                if (submitFormBtn) {
                    submitFormBtn.disabled = false;
                    const btnText = submitFormBtn.querySelector('span');
                    if (btnText) btnText.innerText = 'TRANSMIT SIGNAL';
                }
            });
        });
    }

    if (resetFormBtn && contactForm && successOverlay) {
        resetFormBtn.addEventListener('click', () => {
            contactForm.reset();
            successOverlay.classList.remove('active');
        });
    }

    // Pitch Video Pitch Modal
    const pitchBtn = document.getElementById('pitchBtn');
    const pitchModal = document.getElementById('pitchModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const progressFill = document.querySelector('.video-progress-fill');
    let progressInterval = null;

    if (pitchBtn && pitchModal && closeModalBtn) {
        pitchBtn.addEventListener('click', () => {
            pitchModal.classList.add('active');
            playChimeSound();
            let progress = 15;
            if (progressFill) {
                progressFill.style.width = '15%';
                progressInterval = setInterval(() => {
                    if (progress < 98) {
                        progress += Math.floor(Math.random() * 8) + 2;
                        progressFill.style.width = `${progress}%`;
                    } else {
                        clearInterval(progressInterval);
                    }
                }, 800);
            }
        });

        const closeModal = () => {
            pitchModal.classList.remove('active');
            if (progressInterval) clearInterval(progressInterval);
        };
        closeModalBtn.addEventListener('click', closeModal);
        pitchModal.addEventListener('click', (e) => {
            if (e.target === pitchModal) closeModal();
        });
    }

    // Detailed Case Study Project Modal Data & Handlers
    const projectCards = document.querySelectorAll('.project-card');
    const projectModal = document.getElementById('projectModal');
    const closeProjectModalBtn = document.getElementById('closeProjectModalBtn');
    const projectModalContent = document.getElementById('projectModalContent');

    const PROJECTS_DATA = {
        'eduapply': {
            title: 'EduApply.com Portal',
            category: 'UI/UX Design & Web',
            client: 'EduApply.com',
            role: 'Lead UI/UX Designer',
            duration: '3 Months (2026)',
            tools: ['Figma', 'UI Design', 'Wireframing', 'Prototyping', 'User Research'],
            url: 'https://eduapply.com',
            img: 'assets/eduapply_full.png',
            overview: 'EduApply is an international student recruitment platform that simplifies admissions to European universities.',
            problem: 'The legacy system for overseas admissions was offline, paperwork-heavy, and confusing.',
            solution: 'Designed a responsive, end-to-end portal featuring a dynamic bento-grid wizard tracking document completion.',
            results: 'Improved application completion rate by 42% and reduced average submission time from 15 to 4 days.'
        },
        'shikayat': {
            title: 'Shikayat.pk Portal',
            category: 'UI/UX Design & Web',
            client: 'InoTech Solution',
            role: 'UI/UX Design Intern',
            duration: 'Dec 2023 - Mar 2024',
            tools: ['Figma', 'User Research', 'Wireframing', 'Responsive Design', 'HTML/CSS'],
            url: 'https://shikayat.pk',
            img: 'assets/shikayat_full.png',
            overview: 'Shikayat.pk is a public portal designed to bridge the trust gap between consumers and brands.',
            problem: 'Traditional consumer protection methods were slow and lacked visibility.',
            solution: 'Created a structured categories explorer, verified complaint filing wizard, and brand responsiveness timeline.',
            results: 'Helped resolve over 1,200 consumer complaints in the first three months of launch.'
        },
        'crm': {
            title: 'CRM Board System',
            category: 'SaaS UI/UX Design',
            client: 'SaaS Platform Client',
            role: 'Lead Designer',
            duration: '2 Months (2026)',
            tools: ['Figma', 'SaaS Design', 'Dashboard UX', 'Data Visualization', 'UI Components'],
            url: 'https://crmboard.io',
            img: 'assets/crm_full.png',
            overview: 'A robust client relationship management (CRM) platform built for high-performance sales teams.',
            problem: 'Sales teams were overwhelmed by complex data grids and fragmented client data.',
            solution: 'Designed a unified SaaS layout focusing on clean dashboard card hierarchy and modern telemetry cards.',
            results: 'Reduced average onboarding time for new sales agents by 50%.'
        },
        'eduapply-about': {
            title: 'EduApply Inner Portal',
            category: 'UI/UX Design',
            client: 'EduApply.com',
            role: 'Lead UI/UX Designer',
            duration: '3 Months (2026)',
            tools: ['Figma', 'Interactive Flows', 'Global Map UX', 'UI Kits'],
            url: 'https://eduapply.com/about',
            img: 'assets/eduapply_about.png',
            overview: 'The inner informational hub of the EduApply system, displaying the global connections network.',
            problem: 'Users didn\'t understand how their data was processed or where to start their applications.',
            solution: 'Crafted a detailed global map visual showing active recruitment corridors and customized guides.',
            results: 'Decreased support inquiries related to application prerequisites by 35%.'
        },
        'health': {
            title: 'Health & Fitness App',
            category: 'UI/UX Design',
            client: 'DevGate Consultancy',
            role: 'UI/UX Design Intern',
            duration: 'Sept 2023 - Nov 2023',
            tools: ['Figma', 'Mobile App UX', 'Prototyping'],
            url: '#',
            img: 'assets/mobile_ui.jpg',
            overview: 'An intuitive mobile health companion that tracks workouts and counts daily calorie intake.',
            problem: 'Users frequently abandoned calorie logs because manual logging was tedious.',
            solution: 'Created a card-based mobile UI design featuring rapid one-tap barcode scanners.',
            results: 'Daily active user retention increased by 28% over a 30-day cohort analysis.'
        },
        'ebanking': {
            title: 'E-Banking App Concept',
            category: 'UI/UX Design',
            client: 'DevGate Consultancy',
            role: 'UI/UX Design Intern',
            duration: 'Sept 2023 - Nov 2023',
            tools: ['Figma', 'FinTech UX', 'UI Systems'],
            url: '#',
            img: 'assets/chameleon.jpg',
            overview: 'Modern high-contrast digital banking concept focusing on quick transfers and expense tracking.',
            problem: 'Traditional mobile banking screens suffer from visual clutter and tiny touch targets.',
            solution: 'Designed high-contrast dark mode interfaces with oversized biometric authentication triggers.',
            results: 'Achieved 100% WCAG AAA accessibility compliance across all primary screens.'
        },
        'gitex': {
            title: 'GITEX AI Expo Visuals',
            category: 'Graphic Design',
            client: 'Broomstick Creative (UAE)',
            role: 'Static Graphic Designer',
            duration: 'Nov 2025 - Present',
            tools: ['Adobe Illustrator', 'Photoshop', 'Large Format Print', 'Branding'],
            url: '#',
            img: 'assets/polaroid.jpg',
            overview: 'Large-scale trade show visual assets and exhibition booth graphics for GITEX AI Kazakhstan.',
            problem: 'Required high-impact graphics that retain legibility across 10-meter exhibition displays.',
            solution: 'Created bold duotone neon branding grids combined with sharp vector typography.',
            results: 'Attracted over 20,000 booth visitors during the 3-day international technology expo.'
        },
        'automechanika': {
            title: 'Automechanika Dubai Prints',
            category: 'Graphic Design',
            client: 'Broomstick Creative (UAE)',
            role: 'Static Graphic Designer',
            duration: 'Nov 2025 - Present',
            tools: ['Adobe Illustrator', 'InDesign', 'Print Production'],
            url: '#',
            img: 'assets/totebag.jpg',
            overview: 'Brochures, custom tote bags, and visitor leaflets for one of the largest automotive trade fairs.',
            problem: 'Required high-contrast print layouts that represent automotive logistics cleanly.',
            solution: 'Developed unified branding materials focusing on clean linear grids and vibrant accents.',
            results: 'Produced over 10,000 prints, boosting brand recognition and catalog engagement.'
        }
    };

    if (projectCards && projectModal && closeProjectModalBtn && projectModalContent) {
        projectCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Ignore clicks inside interactive widget controls (canvas, swatches, chips, sticky task inputs)
                if (e.target.closest('canvas, button, .swatch-chip, .variant-chip, .sticky-note, .ruler-card-body, .chalk-color-dot, .font-chip')) {
                    return;
                }

                const projectId = card.getAttribute('data-project-id');
                const project = PROJECTS_DATA[projectId];
                if (!project) return;

                if (typeof playSuccessSound === 'function') playSuccessSound();

                const toolsHTML = project.tools.map(tool => `<span class="project-modal-tool-tag">${tool}</span>`).join('');

                projectModalContent.innerHTML = `
                    <div class="project-modal-grid">
                        <div class="project-modal-gallery">
                            <div class="project-gallery-header">
                                <div class="project-gallery-dots"><span></span><span></span><span></span></div>
                                <div class="project-gallery-url">${project.url}</div>
                            </div>
                            <div class="project-gallery-scroll-container" id="modalScrollContainer">
                                <img src="${project.img}" alt="${project.title} Full Showcase" id="modalMockupImg">
                                <div class="scroll-hint-pill" id="scrollHint">
                                    <i class="fa-solid fa-arrow-down"></i> SCROLL FOR FULL CASE STUDY
                                </div>
                            </div>
                        </div>

                        <div class="project-modal-details">
                            <div class="project-modal-meta">
                                <span class="project-modal-cat">${project.category}</span>
                                <span class="project-modal-role"><i class="fa-solid fa-user-tag"></i> ${project.role}</span>
                            </div>

                            <h2 class="project-modal-title">${project.title}</h2>
                            <p class="project-modal-overview">${project.overview}</p>

                            <div class="project-modal-section">
                                <h4><i class="fa-solid fa-circle-exclamation"></i> The Challenge</h4>
                                <p>${project.problem}</p>
                            </div>

                            <div class="project-modal-section">
                                <h4><i class="fa-solid fa-lightbulb"></i> The Solution</h4>
                                <p>${project.solution}</p>
                            </div>

                            <div class="project-modal-section">
                                <h4><i class="fa-solid fa-chart-line"></i> Key Outcome</h4>
                                <p>${project.results}</p>
                            </div>

                            <div class="project-modal-section">
                                <h4><i class="fa-solid fa-screwdriver-wrench"></i> Stack & Tools</h4>
                                <div class="project-modal-tools-tags">${toolsHTML}</div>
                            </div>

                            <div class="project-modal-actions">
                                <a href="https://www.figma.com/design/eMAJmN9g3PqhKVuPVSIWVi/Fajar-Haroon---Design-Portfolio?node-id=2-10957" target="_blank" class="project-action-btn secondary">
                                    <span>INSPECT FIGMA ARTIFACTS</span>
                                    <i class="fa-brands fa-figma"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `;

                // Add lightbox zoom on mockup image
                const modalMockupImg = document.getElementById('modalMockupImg');
                if (modalMockupImg) {
                    modalMockupImg.style.cursor = 'zoom-in';
                    modalMockupImg.addEventListener('click', () => {
                        openLightbox(modalMockupImg.src, project.title);
                    });
                }

                projectModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeProjectModal = () => {
            projectModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        };

        closeProjectModalBtn.addEventListener('click', closeProjectModal);
        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) closeProjectModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && projectModal.classList.contains('active')) closeProjectModal();
        });
    }

    // 13. WIDGET INTERACTION SCRIPTS

    // Chalkboard Canvas Sketcher
    const chalkboardCanvas = document.getElementById('chalkboardCanvas');
    const clearChalkBtn = document.getElementById('clearChalkBtn');
    let currentChalkColor = '#ffffff';

    if (chalkboardCanvas) {
        const ctx = chalkboardCanvas.getContext('2d');
        let isDrawing = false;
        let lastX = 0, lastY = 0;

        const drawInitialChalkDoodle = () => {
            ctx.clearRect(0, 0, chalkboardCanvas.width, chalkboardCanvas.height);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 1.8;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Top Header Bar Wireframe
            ctx.strokeRect(15, 12, chalkboardCanvas.width - 30, 26);
            ctx.fillRect(25, 20, 30, 10); // Logo placeholder
            ctx.strokeRect(chalkboardCanvas.width - 120, 20, 25, 10); // Nav link 1
            ctx.strokeRect(chalkboardCanvas.width - 85, 20, 25, 10); // Nav link 2
            ctx.strokeRect(chalkboardCanvas.width - 50, 20, 25, 10); // Nav link 3

            // Hero Headline Wireframe Text Lines
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.fillRect(25, 55, 180, 14); // H1 Line 1
            ctx.fillRect(25, 75, 140, 14); // H1 Line 2
            ctx.fillRect(25, 98, 190, 8);  // Subtitle Line 1
            ctx.fillRect(25, 110, 150, 8); // Subtitle Line 2

            // CTA Button Wireframe Box
            ctx.strokeRect(25, 130, 80, 24);
            ctx.fillRect(35, 138, 60, 8);

            // Hero Image Placeholder Box with Diagonal Cross
            const imgX = chalkboardCanvas.width - 165;
            const imgY = 55;
            const imgW = 140;
            const imgH = 100;
            ctx.strokeRect(imgX, imgY, imgW, imgH);
            ctx.beginPath();
            ctx.moveTo(imgX, imgY);
            ctx.lineTo(imgX + imgW, imgY + imgH);
            ctx.moveTo(imgX + imgW, imgY);
            ctx.lineTo(imgX, imgY + imgH);
            ctx.stroke();

            // Wireframe Label
            ctx.font = '11px sans-serif';
            ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
            ctx.fillText('⚡ HERO LAYOUT WIREFRAME v1.0', 25, 175);
        };

        const resizeCanvas = () => {
            const rect = chalkboardCanvas.getBoundingClientRect();
            chalkboardCanvas.width = rect.width;
            chalkboardCanvas.height = rect.height;
            drawInitialChalkDoodle();
        };
        setTimeout(resizeCanvas, 300);

        const getPos = (e) => {
            const rect = chalkboardCanvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return { x: clientX - rect.left, y: clientY - rect.top };
        };

        const startDrawing = (e) => {
            e.stopPropagation();
            isDrawing = true;
            const pos = getPos(e);
            lastX = pos.x; lastY = pos.y;
        };

        const draw = (e) => {
            if (!isDrawing) return;
            e.stopPropagation();
            const pos = getPos(e);
            ctx.strokeStyle = currentChalkColor;
            ctx.shadowColor = currentChalkColor;
            ctx.shadowBlur = 4;
            ctx.lineWidth = Math.random() * 2 + 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            lastX = pos.x; lastY = pos.y;
        };

        const stopDrawing = (e) => {
            if (isDrawing) {
                if (e) e.stopPropagation();
                isDrawing = false;
            }
        };

        chalkboardCanvas.addEventListener('mousedown', startDrawing);
        chalkboardCanvas.addEventListener('mousemove', draw);
        chalkboardCanvas.addEventListener('mouseup', stopDrawing);
        chalkboardCanvas.addEventListener('mouseleave', stopDrawing);

        chalkboardCanvas.addEventListener('touchstart', startDrawing);
        chalkboardCanvas.addEventListener('touchmove', draw);
        chalkboardCanvas.addEventListener('touchend', stopDrawing);

        if (clearChalkBtn) {
            clearChalkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                drawInitialChalkDoodle();
                playTone(400, 'sine', 0.08);
                showToast('Chalkboard Reset to Wireframe', 'fa-eraser');
            });
        }
    }

    const chalkColorDots = document.querySelectorAll('.chalk-color-dot');
    chalkColorDots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            chalkColorDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            currentChalkColor = dot.getAttribute('data-color') || '#ffffff';
            showToast(`Chalk Color: ${currentChalkColor}`, 'fa-pen');
        });
    });

    const chalkTmplBtns = document.querySelectorAll('.chalk-tmpl-btn');
    chalkTmplBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            chalkTmplBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tmpl = btn.getAttribute('data-template');
            if (chalkboardCanvas) {
                const ctx = chalkboardCanvas.getContext('2d');
                ctx.clearRect(0, 0, chalkboardCanvas.width, chalkboardCanvas.height);
                ctx.strokeStyle = currentChalkColor;
                ctx.lineWidth = 1.8;
                if (tmpl === 'hero') {
                    // Draw Hero Layout
                    ctx.strokeRect(15, 12, chalkboardCanvas.width - 30, 26);
                    ctx.fillRect(25, 20, 30, 10);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
                    ctx.fillRect(25, 55, 180, 14);
                    ctx.fillRect(25, 75, 140, 14);
                    ctx.fillRect(25, 98, 190, 8);
                    ctx.strokeRect(25, 130, 80, 24);
                    const imgX = chalkboardCanvas.width - 165;
                    ctx.strokeRect(imgX, 55, 140, 100);
                    ctx.beginPath();
                    ctx.moveTo(imgX, 55); ctx.lineTo(imgX + 140, 155);
                    ctx.moveTo(imgX + 140, 55); ctx.lineTo(imgX, 155);
                    ctx.stroke();
                } else if (tmpl === 'dashboard') {
                    ctx.strokeRect(15, 15, 120, 60);
                    ctx.strokeRect(145, 15, 120, 60);
                    ctx.strokeRect(275, 15, 130, 60);
                    ctx.strokeRect(15, 85, 250, 85);
                    ctx.strokeRect(275, 85, 130, 85);
                } else if (tmpl === 'blank') {
                    ctx.clearRect(0, 0, chalkboardCanvas.width, chalkboardCanvas.height);
                }
            }
            showToast(`Template: ${btn.innerText}`, 'fa-layer-group');
        });
    });

    // Color Swatches
    const swatchChips = document.querySelectorAll('.swatch-chip');
    swatchChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            e.stopPropagation();
            const hex = chip.getAttribute('data-hex');
            if (hex) {
                navigator.clipboard.writeText(hex).then(() => {
                    const originalText = chip.querySelector('.swatch-hex').innerText;
                    chip.querySelector('.swatch-hex').innerText = 'COPIED!';
                    playSuccessSound();
                    showToast(`Copied ${hex} to clipboard!`, 'fa-copy');
                    setTimeout(() => { chip.querySelector('.swatch-hex').innerText = originalText; }, 1200);
                }).catch(() => {});
            }
        });
    });

    let currentSwatchFmt = 'HEX';
    const swatchFmtBtn = document.getElementById('swatchFmtBtn');
    if (swatchFmtBtn) {
        swatchFmtBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const formats = ['HEX', 'RGB', 'HSL'];
            const nextIndex = (formats.indexOf(currentSwatchFmt) + 1) % formats.length;
            currentSwatchFmt = formats[nextIndex];
            swatchFmtBtn.innerText = currentSwatchFmt;

            const chips = document.querySelectorAll('.swatch-chip');
            chips.forEach(chip => {
                const val = chip.getAttribute(`data-${currentSwatchFmt.toLowerCase()}`) || chip.getAttribute('data-hex');
                chip.querySelector('.swatch-hex').innerText = val;
            });
            showToast(`Color Format: ${currentSwatchFmt}`, 'fa-palette');
        });
    }

    // Cyber Matrix Scramble
    const scrambleTitle = document.getElementById('crmScrambleTitle');
    const scrambleDesc = document.getElementById('crmScrambleDesc');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';

    const triggerScramble = (el) => {
        if (!el) return;
        const originalText = el.innerText;
        let iteration = 0;
        const interval = setInterval(() => {
            el.innerText = originalText.split('').map((char, index) => {
                if (index < iteration) return originalText[index];
                return chars[Math.floor(Math.random() * chars.length)];
            }).join('');
            if (iteration >= originalText.length) clearInterval(interval);
            iteration += 1 / 2;
        }, 30);
    };

    const matrixCard = document.querySelector('.card-matrix');
    if (matrixCard) {
        matrixCard.addEventListener('mouseenter', () => { triggerScramble(scrambleTitle); });
    }

    const reScrambleBtn = document.getElementById('reScrambleBtn');
    if (reScrambleBtn) {
        reScrambleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerScramble(scrambleTitle);
            triggerScramble(scrambleDesc);
            const tick = document.getElementById('matrixTick');
            if (tick) tick.innerText = `REQ/S: ${Math.floor(Math.random() * 800 + 1200)}`;
            showToast('Telemetry Data Re-Scrambled', 'fa-terminal');
        });
    }

    // Figma Variant Switcher
    const variantChips = document.querySelectorAll('.variant-chip');
    const figmaDemoBtn = document.getElementById('figmaDemoBtn');
    const variantStateLabel = document.getElementById('variantStateLabel');
    const figmaSpecCode = document.getElementById('figmaSpecCode');
    const specMap = {
        'default': 'padding: 10px 20px | radius: 10px | bg: #4F46E5',
        'hover': 'padding: 10px 20px | radius: 10px | bg: #A246F0 | scale: 1.05',
        'active': 'padding: 10px 20px | radius: 10px | bg: #00F0FF | scale: 0.95',
        'disabled': 'padding: 10px 20px | radius: 10px | bg: #3F3F46 | cursor: not-allowed'
    };

    if (variantChips && figmaDemoBtn) {
        variantChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.stopPropagation();
                variantChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                const state = chip.getAttribute('data-state');
                figmaDemoBtn.className = `figma-demo-btn state-${state}`;
                if (variantStateLabel) variantStateLabel.innerText = `Active: ${state.charAt(0).toUpperCase() + state.slice(1)}`;
                if (figmaSpecCode && specMap[state]) figmaSpecCode.innerText = specMap[state];
                playClickSound();
                showToast(`Figma Variant: ${state.toUpperCase()}`, 'fa-brands fa-figma');
            });
        });
    }

    // Sticky Sprint Kanban Notes
    const stickyNotes = document.querySelectorAll('.sticky-note');
    const stickyStack = document.getElementById('stickyStack');
    const stickyProgress = document.getElementById('stickyProgress');

    const updateStickyProgress = () => {
        if (!stickyStack || !stickyProgress) return;
        const all = stickyStack.querySelectorAll('.sticky-note');
        const completed = stickyStack.querySelectorAll('.sticky-note.completed');
        stickyProgress.innerText = `${completed.length} / ${all.length} Completed`;
    };

    stickyNotes.forEach(note => {
        note.addEventListener('click', (e) => {
            e.stopPropagation();
            note.classList.toggle('completed');
            const check = note.querySelector('.sticky-check');
            if (check) check.innerText = note.classList.contains('completed') ? '✓' : '○';
            updateStickyProgress();
            playClickSound();
        });
    });

    const addStickyBtn = document.getElementById('addStickyBtn');
    if (addStickyBtn && stickyStack) {
        addStickyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskText = prompt("Enter new UX Sprint Task:", "Design System Audit");
            if (taskText) {
                const colors = ['note-yellow', 'note-purple', 'note-cyan'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                const note = document.createElement('div');
                note.className = `sticky-note ${randomColor}`;
                note.innerHTML = `<span class="sticky-check">○</span><span class="sticky-text">${taskText}</span>`;
                note.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    note.classList.toggle('completed');
                    note.querySelector('.sticky-check').innerText = note.classList.contains('completed') ? '✓' : '○';
                    updateStickyProgress();
                    playClickSound();
                });
                stickyStack.appendChild(note);
                updateStickyProgress();
                showToast(`Task Added: ${taskText}`, 'fa-note-sticky');
            }
        });
    }

    // Pixel Spec Ruler Crosshair
    const rulerBody = document.getElementById('rulerBody');
    const rulerH = document.getElementById('rulerH');
    const rulerV = document.getElementById('rulerV');
    const rulerCoords = document.getElementById('rulerCoords');

    if (rulerBody && rulerH && rulerV && rulerCoords) {
        rulerBody.addEventListener('mousemove', (e) => {
            const rect = rulerBody.getBoundingClientRect();
            const x = Math.round(e.clientX - rect.left);
            const y = Math.round(e.clientY - rect.top);
            rulerH.style.top = `${y}px`;
            rulerV.style.left = `${x}px`;
            rulerCoords.innerText = `X: ${x}px | Y: ${y}px`;
        });
    }

    // Kinetic Marquee Controls
    const marqueePauseBtn = document.getElementById('marqueePauseBtn');
    const marqueeSpeedBtn = document.getElementById('marqueeSpeedBtn');
    const marqueeContent = document.getElementById('marqueeContent');
    let isMarqueePaused = false;
    let isMarqueeFast = false;

    if (marqueePauseBtn && marqueeContent) {
        marqueePauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isMarqueePaused = !isMarqueePaused;
            marqueeContent.style.animationPlayState = isMarqueePaused ? 'paused' : 'running';
            marqueePauseBtn.innerHTML = isMarqueePaused ? '<i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-pause"></i>';
            showToast(isMarqueePaused ? 'Marquee Paused' : 'Marquee Playing', 'fa-wand-magic-sparkles');
        });
    }

    if (marqueeSpeedBtn && marqueeContent) {
        marqueeSpeedBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isMarqueeFast = !isMarqueeFast;
            marqueeContent.style.animationDuration = isMarqueeFast ? '5s' : '12s';
            marqueeSpeedBtn.innerText = isMarqueeFast ? '⚡ 3x' : '⚡ 1x';
            showToast(isMarqueeFast ? 'Speed: 3x' : 'Speed: 1x', 'fa-bolt');
        });
    }

    const fontChips = document.querySelectorAll('.font-chip');
    fontChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            e.stopPropagation();
            fontChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const font = chip.getAttribute('data-font');
            if (marqueeContent) marqueeContent.style.fontFamily = font;
            showToast(`Font: ${font}`, 'fa-font');
        });
    });

    // Holographic Glitch 3D Tilt
    const glitchCard = document.getElementById('glitchCard');
    const glitchFoil = document.getElementById('glitchFoil');
    const triggerGlitchBtn = document.getElementById('triggerGlitchBtn');
    const glitchTitleText = document.getElementById('glitchTitleText');

    if (glitchCard && glitchFoil) {
        glitchCard.addEventListener('mousemove', (e) => {
            const rect = glitchCard.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            glitchFoil.style.transform = `rotate(${25 + x * 30}deg) translate(${x * 40}px, ${y * 40}px)`;
        });
    }

    if (triggerGlitchBtn && glitchTitleText) {
        triggerGlitchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerScramble(glitchTitleText);
            glitchTitleText.style.animation = 'none';
            setTimeout(() => {
                glitchTitleText.style.animation = 'glitchText 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both';
            }, 10);
            showToast('Glitch Effect Triggered!', 'fa-bolt');
        });
    }
});
