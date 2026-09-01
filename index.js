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

        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime); // Low volume
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.warn("Audio synthesis error:", e);
    }
}

// Play specific interface tones
function playHoverSound() {
    playTone(1000, 'sine', 0.05, 1400);
}

function playClickSound() {
    playTone(600, 'triangle', 0.12, 1000);
}

function playSuccessSound() {
    playTone(800, 'sine', 0.1, 1200);
    setTimeout(() => playTone(1200, 'sine', 0.2, 1600), 100);
}

function playChimeSound() {
    playTone(1500, 'sine', 0.4, 200);
}

// SETUP SOUND TOGGLE
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

// DOM LOAD LOGIC
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. LIQUID GLASS CURSOR TRACKER
    const cursorDot = document.getElementById('cursorDot');
    const cursorGlow = document.getElementById('cursorGlow');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let glowX = mouseX;
    let glowY = mouseY;
    let cursorActive = false;

    const handlePointerMove = (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!cursorActive) {
            cursorActive = true;
            if (cursorDot) cursorDot.style.opacity = '1';
            if (cursorGlow) cursorGlow.style.opacity = '1';
        }
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('pointermove', handlePointerMove);

    // Animate custom cursor with liquid smoothing inertia
    function animateCursor() {
        const dotSpeed = 0.35;
        const glowSpeed = 0.14;

        dotX += (mouseX - dotX) * dotSpeed;
        dotY += (mouseY - dotY) * dotSpeed;
        glowX += (mouseX - glowX) * glowSpeed;
        glowY += (mouseY - glowY) * glowSpeed;

        if (cursorDot) {
            cursorDot.style.left = `${dotX}px`;
            cursorDot.style.top = `${dotY}px`;
        }
        if (cursorGlow) {
            cursorGlow.style.left = `${glowX}px`;
            cursorGlow.style.top = `${glowY}px`;
        }

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

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

    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button, .floating-card, .sim-app-btn, .magnetic-tag, .project-card, .timeline-card, .swatch-chip, .variant-chip, .sticky-note, canvas, [role="button"]');
        if (target) {
            if (typeof playClickSound === 'function') playClickSound();
        }
    });

    // 2. HERO PARALLAX & TILT SYSTEM
    const hero = document.getElementById('home');
    const cards = document.querySelectorAll('.floating-card');
    const heroWords = document.querySelectorAll('.hero-word');
    
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Calculate offset percentages from center (-0.5 to 0.5)
            const xVal = (e.clientX / width) - 0.5;
            const yVal = (e.clientY / height) - 0.5;

            // Parallax cards movement
            cards.forEach(card => {
                const depth = parseFloat(card.getAttribute('data-depth')) || 0.1;
                const xMove = xVal * width * depth;
                const yMove = yVal * height * depth;
                
                // 3D Tilt calculation
                const tiltX = -yVal * 15;
                const tiltY = xVal * 15;

                card.style.transform = `translate3d(${xMove}px, ${yMove}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
            });

            // Parallax letters shift (opposite direction)
            heroWords.forEach((word, index) => {
                const depth = (index + 1) * 0.03;
                const xMove = -xVal * width * depth;
                const yMove = -yVal * height * depth;
                word.style.transform = `translate(${xMove}px, ${yMove}px)`;
            });
        });

        // Reset positions when mouse leaves
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

        // Make transition smooth during reset and remove it on move
        hero.addEventListener('mouseenter', () => {
            cards.forEach(card => {
                card.style.transition = 'none';
            });
            heroWords.forEach(word => {
                word.style.transition = 'none';
            });
        });
    }

    // 3. BEFORE / AFTER SLIDER WIDGET
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

    // 4. HTML5 CANVAS SCRATCH CARD WIDGET
    const canvas = document.getElementById('scratchCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        
        // Fill canvas with silver/purple overlay
        function initScratchCanvas() {
            ctx.fillStyle = '#221a35';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add grid patterns / text on scratch card
            ctx.font = '800 14px Outfit';
            ctx.fillStyle = '#8a2be2';
            ctx.textAlign = 'center';
            ctx.fillText('SCRATCH WITH CURSOR', canvas.width / 2, canvas.height / 2 - 10);
            
            ctx.font = '500 11px Inter';
            ctx.fillStyle = '#a278ed';
            ctx.fillText('TO REVEAL ACHIEVEMENT', canvas.width / 2, canvas.height / 2 + 15);
            
            // Draw clean border line inside canvas
            ctx.strokeStyle = 'rgba(162, 120, 237, 0.3)';
            ctx.lineWidth = 2;
            ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        }
        initScratchCanvas();

        function getMousePos(e) {
            const rect = canvas.getBoundingClientRect();
            // Handle touch vs mouse
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
            
            checkScratchPercentage();
        }

        canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
        canvas.addEventListener('mousemove', scratch);
        window.addEventListener('mouseup', () => { isDrawing = false; });

        // Touch support
        canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); });
        canvas.addEventListener('touchmove', scratch);
        window.addEventListener('touchend', () => { isDrawing = false; });

        // Calculate transparent pixel percentage to fully reveal reward
        function checkScratchPercentage() {
            try {
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imgData.data;
                let transparentCount = 0;
                
                for (let i = 3; i < pixels.length; i += 4) {
                    if (pixels[i] === 0) {
                        transparentCount++;
                    }
                }
                
                const percentage = (transparentCount / (canvas.width * canvas.height)) * 100;
                if (percentage > 45) { // Clear canvas if 45% scratched
                    canvas.style.transition = 'opacity 0.6s ease';
                    canvas.style.opacity = '0';
                    setTimeout(() => canvas.remove(), 600);
                    playSuccessSound();
                }
            } catch (err) {
                console.error("Canvas pixel check failed:", err);
            }
        }
    }

    // 5. INTERACTIVE PHONE SIMULATOR
    const simButtons = document.querySelectorAll('.sim-app-btn');
    const screenImg = document.getElementById('phoneScreenImg');

    simButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            simButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const newImg = btn.getAttribute('data-img');
            screenImg.style.opacity = '0';
            screenImg.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                screenImg.src = newImg;
                screenImg.style.opacity = '1';
            }, 300);
        });
    });

    // 6. MAGNETIC SKILL BADGES
    const magneticContainer = document.getElementById('magneticContainer');
    const tags = document.querySelectorAll('.magnetic-tag');

    if (magneticContainer) {
        magneticContainer.addEventListener('mousemove', (e) => {
            const containerRect = magneticContainer.getBoundingClientRect();
            const mouseX = e.clientX - containerRect.left;
            const mouseY = e.clientY - containerRect.top;

            tags.forEach(tag => {
                const tagRect = tag.getBoundingClientRect();
                const tagX = (tagRect.left - containerRect.left) + tagRect.width / 2;
                const tagY = (tagRect.top - containerRect.top) + tagRect.height / 2;

                const distanceX = mouseX - tagX;
                const distanceY = mouseY - tagY;
                const distance = Math.hypot(distanceX, distanceY);

                if (distance < 90) { // Attract bubble field
                    const attractionPower = (90 - distance) / 90; // 0 to 1
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

        magneticContainer.addEventListener('mouseenter', () => {
            tags.forEach(tag => {
                tag.style.transition = 'none';
            });
        });
    }

    // 7. GRAVITY SWITCH / WIGGLE PHYSICS EASTER EGG
    const physicsBtn = document.getElementById('physicsBtn');
    if (physicsBtn) {
        physicsBtn.addEventListener('click', () => {
            const isActive = document.body.classList.toggle('override-physics-mode');
            physicsBtn.classList.toggle('active');
            
            if (isActive) {
                physicsBtn.querySelector('span').innerText = 'RESTORE GRAVITY';
                playChimeSound();
            } else {
                physicsBtn.querySelector('span').innerText = 'OVERRIDE GRAVITY';
                playTone(400, 'sine', 0.2);
            }
        });
    }

    // 8. WORK / PROJECT GRID FILTERING
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
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
                    }, 350);
                }
            });
        });
    });

    // 9. EXPANDABLE EXPERIENCE TIMELINE CARDS
    const timelineCards = document.querySelectorAll('.timeline-card');
    timelineCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('expanded');
        });
    });

    // 10. CONTACT FORM ACTION
    const contactForm = document.getElementById('contactForm');
    const successOverlay = document.getElementById('formSuccess');
    const resetFormBtn = document.getElementById('resetFormBtn');
    const submitFormBtn = document.getElementById('submitFormBtn');

    if (contactForm && successOverlay) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Set loading state on submit button
            if (submitFormBtn) {
                submitFormBtn.disabled = true;
                const btnText = submitFormBtn.querySelector('span');
                if (btnText) btnText.innerText = 'TRANSMITTING...';
            }

            const formData = new FormData(contactForm);

            // AJAX submit to Web3Forms API
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            })
            .then(async (response) => {
                const result = await response.json();
                if (response.status === 200 || result.success) {
                    playSuccessSound();
                    successOverlay.classList.add('active');
                } else {
                    console.error("Web3Forms error response:", result);
                    alert(result.message || "Something went wrong! Please verify your Access Key.");
                }
            })
            .catch((error) => {
                console.error("Contact Form submission error:", error);
                alert("Transmit failed. Please check your network connection or try again later.");
            })
            .finally(() => {
                // Restore button state
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

    // 11. PITCH VIDEO MODAL TRIGGER
    const pitchBtn = document.getElementById('pitchBtn');
    const pitchModal = document.getElementById('pitchModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const progressFill = document.querySelector('.video-progress-fill');
    let progressInterval = null;

    if (pitchBtn && pitchModal && closeModalBtn) {
        pitchBtn.addEventListener('click', () => {
            pitchModal.classList.add('active');
            playChimeSound();
            
            // Simulating video progress percentage bar loading
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
            if (progressInterval) {
                clearInterval(progressInterval);
            }
        };

        closeModalBtn.addEventListener('click', closeModal);
        pitchModal.addEventListener('click', (e) => {
            if (e.target === pitchModal) {
                closeModal();
            }
        });
    }

    // 12. DETAILED PROJECT SHOWCASE MODAL TRIGGER
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
            overview: 'EduApply is an international student recruitment platform that simplifies admissions to European universities. The goal was to build a comprehensive dashboard connecting students, universities, and agents.',
            problem: 'The legacy system for overseas admissions was offline, paperwork-heavy, and confusing. Students struggled with translation, tracking multiple application requirements, and understanding visa procedures.',
            solution: 'Designed a responsive, end-to-end portal featuring a dynamic bento-grid wizard that tracks document completion, provides interactive country matching algorithms, and visualizes progress in real time.',
            results: 'Improved application completion rate by 42% and reduced average submission time from 15 days down to just 4 days, resulting in a highly satisfied international student base.'
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
            overview: 'Shikayat.pk is a public portal designed to bridge the trust gap between consumers and brands. It allows citizens to lodge verified complaints, track brand responsiveness, and read transparent reviews.',
            problem: 'Traditional consumer protection methods were slow and lacked visibility. Public complaints on social media were unorganized, leading to brand apathy and unresolved issues.',
            solution: 'Created a structured categories explorer, a step-by-step verified filing wizard, and interactive company response timelines. Clean, lavender-themed typography was used to create a professional and authoritative atmosphere.',
            results: 'Helped resolve over 1,200 consumer complaints in the first three months of launch. Increased user engagement on the reviews dashboard by 65%.'
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
            overview: 'A robust client relationship management (CRM) platform built for high-performance sales teams. Features live parameter dials, partner networking directories, and instant revenue KPI trackers.',
            problem: 'Sales teams were overwhelmed by complex data grids and fragmented client data. High bounce rates and user errors on the dashboard were stalling sales funnels.',
            solution: 'Designed a unified SaaS layout focusing on clean dashboard card hierarchy, custom data visualizations, and modern telemetry cards. Ensured dark/light mode harmonized color structures.',
            results: 'Reduced average onboarding time for new sales agents by 50% and lowered interactive click count for key daily reports by 40%.'
        },
        'eduapply-about': {
            title: 'EduApply Inner Portal',
            category: 'UI/UX Design',
            client: 'EduApply.com',
            role: 'Lead UI/UX Designer',
            duration: '3 Months (2026)',
            tools: ['Figma', 'Interactive Flows', 'Global Map UX', 'UI Kits', 'About Page Design'],
            url: 'https://eduapply.com/about',
            img: 'assets/eduapply_about.png',
            overview: 'The inner informational hub of the EduApply system, displaying the global connections network, university matching tools, and step-by-step registration guidelines.',
            problem: 'Users didn\'t understand how their data was processed, how regional partnerships were structured, or where to start their applications.',
            solution: 'Crafted a detailed global map visual showing active recruitment corridors, customized guides for students and universities, and a transparent progress roadmap.',
            results: 'Decreased support inquiries related to application prerequisites by 35% within the first month of deployment.'
        },
        'health': {
            title: 'Health & Fitness App',
            category: 'UI/UX Design',
            client: 'DevGate Consultancy',
            role: 'UI/UX Design Intern',
            duration: 'Sept 2023 - Nov 2023',
            tools: ['Figma', 'Mobile App UX', 'Prototyping', 'User Flows'],
            url: '#',
            img: 'assets/mobile_ui.jpg',
            overview: 'An intuitive mobile health companion that tracks workouts, counts daily calorie intake, and provides interactive fitness analytics.',
            problem: 'Users frequently abandoned calorie logs because manual logging was tedious, and charts were too complex for average users.',
            solution: 'Created a card-based mobile UI design featuring rapid one-tap barcode scanners, friendly progress rings, and gamified streak indicators.',
            results: 'Daily active user retention increased by 28% over a 30-day cohort analysis.'
        },
        'ebanking': {
            title: 'E-Banking App Concept',
            category: 'UI/UX Design',
            client: 'DevGate Consultancy',
            role: 'UI/UX Design Intern',
            duration: 'Sept 2023 - Nov 2023',
            tools: ['Figma', 'Mobile Banking UX', 'High-Contrast UI', 'Security Flows'],
            url: '#',
            img: 'assets/mobile_ui.jpg',
            overview: 'A secure, high-contrast mobile banking interface centered around instant money transfer, balance reports, and recurring bills organizer.',
            problem: 'Most banking apps are cluttered with legacy menu items, making simple transfers stressful and error-prone.',
            solution: 'Designed a minimalist mobile interface prioritizing the "Send Money" action, integrating biometric login pathways, and displaying clear, readable transaction receipts.',
            results: 'Tested prototype achieved a 98% task completion success rate in consumer usability trials.'
        },
        'gitex': {
            title: 'GITEX AI Kazakhstan Visuals',
            category: 'Graphic Design',
            client: 'Broomstick Creative (UAE)',
            role: 'Static Graphic Designer',
            duration: 'Nov 2025 - Present',
            tools: ['Adobe Illustrator', 'Adobe Photoshop', 'Brand Guidelines', 'Print Media'],
            url: '#',
            img: 'assets/chameleon.jpg',
            overview: 'Created high-impact branding prints, event banners, and social collateral for international tech expos.',
            problem: 'Needed premium visual assets that communicate cutting-edge technology (AI) while adhering strictly to regional and corporate design guidelines.',
            solution: 'Designed custom voxel-inspired and vector assets with bold duotone and neon palettes, projecting an elite, high-tech identity.',
            results: 'Exhibition booth attracted record footfall, with graphic assets praised for visual cohesion.'
        },
        'automechanika': {
            title: 'Automechanika Dubai Prints',
            category: 'Graphic Design',
            client: 'Broomstick Creative (UAE)',
            role: 'Static Graphic Designer',
            duration: 'Nov 2025 - Present',
            tools: ['Adobe Illustrator', 'InDesign', 'Print Production', 'Event Guides'],
            url: '#',
            img: 'assets/totebag.jpg',
            overview: 'Designed high-fidelity brochures, custom tote bags, and visitor leaflets for one of the largest automotive trade fairs.',
            problem: 'Required high-contrast print layouts that represent automotive logistics cleanly and stand out in a heavily crowded exhibition hall.',
            solution: 'Developed unified branding materials focusing on clean linear grids, bold monochromatic base layouts, and vibrant orange highlighting accents.',
            results: 'Produced over 10,000 prints, boosting brand recognition and catalog engagement at the trade show.'
        }
    };

    if (projectCards && projectModal && closeProjectModalBtn && projectModalContent) {
        projectCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Prevent modal opening if clicking inside interactive widget controls
                if (e.target.closest('canvas, button, .swatch-chip, .variant-chip, .sticky-note, .ruler-card-body')) {
                    return;
                }

                const projectId = card.getAttribute('data-project-id');
                const project = PROJECTS_DATA[projectId];

                if (!project) return;

                // Play portal transition chime (reusing project's audio context player)
                if (typeof playSuccessSound === 'function') {
                    playSuccessSound();
                } else if (typeof playChimeSound === 'function') {
                    playChimeSound();
                }

                // Format tools HTML
                const toolsHTML = project.tools.map(tool => `<span class="project-modal-tool-tag">${tool}</span>`).join('');

                // Populate modal content
                projectModalContent.innerHTML = `
                    <div class="project-modal-grid">
                        <!-- Left: Scrollable Mockup Frame -->
                        <div class="project-modal-gallery">
                            <div class="project-gallery-header">
                                <div class="project-gallery-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <div class="project-gallery-url">${project.url}</div>
                            </div>
                            <div class="project-gallery-scroll-container" id="modalScrollContainer">
                                <div class="scroll-hint-overlay" id="scrollHint">
                                    <i class="fa-solid fa-angles-down"></i>
                                    <span>SCROLL TO EXPLORE PAGE</span>
                                </div>
                                <img src="${project.img}" alt="${project.title} Preview">
                            </div>
                        </div>

                        <!-- Right: Case Study Info -->
                        <div class="project-modal-details">
                            <span class="project-modal-category">${project.category}</span>
                            <h3 class="project-modal-title">${project.title}</h3>

                            <div class="project-modal-meta-grid">
                                <div class="meta-item">
                                    <span class="meta-label">Client</span>
                                    <span class="meta-value">${project.client}</span>
                                </div>
                                <div class="meta-item">
                                    <span class="meta-label">Role</span>
                                    <span class="meta-value">${project.role}</span>
                                </div>
                                <div class="meta-item">
                                    <span class="meta-label">Timeline</span>
                                    <span class="meta-value">${project.duration}</span>
                                </div>
                                <div class="meta-item">
                                    <span class="meta-label">Live Link</span>
                                    <span class="meta-value">${project.url !== '#' ? `<a href="${project.url}" target="_blank" style="color: var(--accent-cyan); text-decoration: none;">Visit Site <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.7rem;"></i></a>` : 'Offline Prototype'}</span>
                                </div>
                            </div>

                            <div class="project-modal-section">
                                <h4><i class="fa-solid fa-circle-info"></i> Project Overview</h4>
                                <p>${project.overview}</p>
                            </div>

                            <div class="project-modal-section">
                                <h4><i class="fa-solid fa-triangle-exclamation"></i> The Challenge</h4>
                                <p>${project.problem}</p>
                            </div>

                            <div class="project-modal-section">
                                <h4><i class="fa-solid fa-lightbulb"></i> The Solution</h4>
                                <p>${project.solution}</p>
                            </div>

                            <div class="project-modal-section">
                                <h4><i class="fa-solid fa-chart-line"></i> Key Outcome & Results</h4>
                                <p>${project.results}</p>
                            </div>

                            <div class="project-modal-section">
                                <h4><i class="fa-solid fa-screwdriver-wrench"></i> Stack & Tools</h4>
                                <div class="project-modal-tools-tags">
                                    ${toolsHTML}
                                </div>
                            </div>

                            <div class="project-modal-actions">
                                ${project.url !== '#' ? `
                                <a href="${project.url}" target="_blank" class="project-action-btn primary">
                                    <span>LAUNCH LIVE DEPLOYMENT</span>
                                    <i class="fa-solid fa-rocket"></i>
                                </a>` : `
                                <button class="project-action-btn primary" onclick="alert('Interactive prototype is currently private. Please refer to resume or Figma links for access.')">
                                    <span>PROTOTYPE LOCKED</span>
                                    <i class="fa-solid fa-lock"></i>
                                </button>
                                `}
                                <a href="https://www.figma.com/design/eMAJmN9g3PqhKVuPVSIWVi/Fajar-Haroon---Design-Portfolio?node-id=2-10957" target="_blank" class="project-action-btn secondary">
                                    <span>INSPECT FIGMA ARTIFACTS</span>
                                    <i class="fa-brands fa-figma"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `;

                // Show modal
                projectModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Lock main scroll

                // Setup scroll hint fadeout
                const scrollContainer = document.getElementById('modalScrollContainer');
                const scrollHint = document.getElementById('scrollHint');

                if (scrollContainer && scrollHint) {
                    scrollContainer.addEventListener('scroll', () => {
                        if (scrollContainer.scrollTop > 30) {
                            scrollHint.classList.add('hidden');
                        } else {
                            scrollHint.classList.remove('hidden');
                        }
                    });
                }
            });
        });

        const closeProjectModal = () => {
            projectModal.classList.remove('active');
            document.body.style.overflow = 'auto'; // Restore scroll
        };

        closeProjectModalBtn.addEventListener('click', closeProjectModal);
        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) {
                closeProjectModal();
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && projectModal.classList.contains('active')) {
                closeProjectModal();
            }
        });
    }

    // 13. PLAYFUL DESIGNER WIDGET INTERACTION SCRIPTS

    // (A) Chalkboard Drawing Canvas Logic
    const chalkboardCanvas = document.getElementById('chalkboardCanvas');
    const clearChalkBtn = document.getElementById('clearChalkBtn');

    if (chalkboardCanvas) {
        const ctx = chalkboardCanvas.getContext('2d');
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        const drawInitialChalkDoodle = () => {
            ctx.clearRect(0, 0, chalkboardCanvas.width, chalkboardCanvas.height);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Draw a wireframe box & star on blackboard
            ctx.beginPath();
            ctx.rect(20, 20, 160, 90);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(280, 65, 25, 0, Math.PI * 2);
            ctx.stroke();

            ctx.font = '13px sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.fillText('⚡ UX WIREFRAME BOARD', 25, 140);
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
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        const startDrawing = (e) => {
            e.stopPropagation(); // Stop parent modal trigger when drawing
            isDrawing = true;
            const pos = getPos(e);
            lastX = pos.x;
            lastY = pos.y;
        };

        const draw = (e) => {
            if (!isDrawing) return;
            e.stopPropagation();
            const pos = getPos(e);

            ctx.strokeStyle = '#ffffff';
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 4;
            ctx.lineWidth = Math.random() * 2 + 2;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();

            lastX = pos.x;
            lastY = pos.y;
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
                e.stopPropagation(); // Prevent opening modal
                drawInitialChalkDoodle();
                if (typeof playTone === 'function') playTone(400, 'sine', 0.08);
            });
        }
    }

    // (B) Color Swatch Lab - Copy Hex Code
    const swatchChips = document.querySelectorAll('.swatch-chip');
    swatchChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent modal opening
            const hex = chip.getAttribute('data-hex');
            if (hex) {
                navigator.clipboard.writeText(hex).then(() => {
                    const originalText = chip.querySelector('.swatch-hex').innerText;
                    chip.querySelector('.swatch-hex').innerText = 'COPIED!';
                    if (typeof playSuccessSound === 'function') playSuccessSound();
                    setTimeout(() => {
                        chip.querySelector('.swatch-hex').innerText = originalText;
                    }, 1200);
                }).catch(() => {});
            }
        });
    });

    // (C) Cyber Matrix Scramble
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
            
            if (iteration >= originalText.length) {
                clearInterval(interval);
            }
            iteration += 1 / 2;
        }, 30);
    };

    const matrixCard = document.querySelector('.card-matrix');
    if (matrixCard) {
        matrixCard.addEventListener('mouseenter', () => {
            triggerScramble(scrambleTitle);
        });
    }

    // (D) Figma Variant Switcher Logic
    const variantChips = document.querySelectorAll('.variant-chip');
    const figmaDemoBtn = document.getElementById('figmaDemoBtn');
    const variantStateLabel = document.getElementById('variantStateLabel');

    if (variantChips && figmaDemoBtn) {
        variantChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent modal opening
                variantChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                const state = chip.getAttribute('data-state');
                figmaDemoBtn.className = `figma-demo-btn state-${state}`;
                if (variantStateLabel) {
                    variantStateLabel.innerText = `Active: ${state.charAt(0).toUpperCase() + state.slice(1)}`;
                }
                if (typeof playClickSound === 'function') playClickSound();
            });
        });
    }

    // (E) Sticky Sprint Kanban Notes
    const stickyNotes = document.querySelectorAll('.sticky-note');
    stickyNotes.forEach(note => {
        note.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent modal opening
            note.classList.toggle('completed');
            const check = note.querySelector('.sticky-check');
            if (check) {
                check.innerText = note.classList.contains('completed') ? '✓' : '○';
            }
            if (typeof playClickSound === 'function') playClickSound();
        });
    });

    // (F) Pixel Spec Ruler Crosshair Coordinates
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
});

