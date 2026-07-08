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
    
    // 1. LIQUID CURSOR TRACKER
    const cursorDot = document.getElementById('cursorDot');
    const cursorGlow = document.getElementById('cursorGlow');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let glowX = mouseX;
    let glowY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Animate custom cursor with smoothing inertia
    function animateCursor() {
        const dotSpeed = 0.3;
        const glowSpeed = 0.12;

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

    // Hover state toggles for cursor glow
    const hoverElements = document.querySelectorAll('a, button, .floating-card, .sim-app-btn, .magnetic-tag, .project-card, .timeline-card, input, textarea');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hovering');
            playHoverSound();
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hovering');
        });
        el.addEventListener('click', () => {
            playClickSound();
        });
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
});
