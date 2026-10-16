// Design Harvest Consultants - Dynamic Script with Data Store & Admin Sync

// Utility: convert hex to rgba
function hexToRgba(hex, alpha = 0.95) {
    if (!hex) return 'rgba(10, 10, 10, 0.95)';
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    if (isNaN(num)) return 'rgba(10, 10, 10, 0.95)';
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Utility: escape HTML
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Get active site data (localStorage takes precedence over default data.js)
function getActiveSiteData() {
    try {
        const stored = localStorage.getItem('design_harvest_site_data');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === 'object') {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Could not read from localStorage, using default site data', e);
    }
    return window.DEFAULT_SITE_DATA || {};
}

// Global active site data
let currentSiteData = getActiveSiteData();

// Apply Theme / Colors dynamically
function applyTheme(theme) {
    if (!theme) return;
    const root = document.documentElement;
    if (theme.bgColor) {
        root.style.setProperty('--black', theme.bgColor);
        root.style.setProperty('--nav-bg', hexToRgba(theme.bgColor, 0.95));
    }
    if (theme.darkBg) {
        root.style.setProperty('--dark-bg', theme.darkBg);
    }
    if (theme.primaryGold) {
        root.style.setProperty('--primary-gold', theme.primaryGold);
    }
    if (theme.textColor) {
        root.style.setProperty('--text-color', theme.textColor);
    }
}

// --- Slideshow Logic ---
let slideInterval = null;
let currentSlideIndex = 0;
let activeHeroSlides = [];

function initSlideshow(slides, speed = 5000) {
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
    }

    activeHeroSlides = slides || [];
    currentSlideIndex = 0;

    const slideElements = document.querySelectorAll('.hero-slideshow .slide');
    const dotElements = document.querySelectorAll('.slide-controls .dot');
    const heroCaption = document.getElementById('hero-project-name');

    if (!slideElements.length) return;

    // Set initial caption
    if (heroCaption && activeHeroSlides[0]) {
        heroCaption.textContent = activeHeroSlides[0].title || '';
        setTimeout(() => heroCaption.classList.add('visible'), 300);
    }

    // Attach click listeners to dots
    dotElements.forEach((dot, index) => {
        dot.onclick = () => {
            goToSlide(index);
            restartInterval(speed);
        };
    });

    slideInterval = setInterval(nextSlide, speed);
}

function nextSlide() {
    const slideElements = document.querySelectorAll('.hero-slideshow .slide');
    const dotElements = document.querySelectorAll('.slide-controls .dot');
    if (!slideElements.length) return;

    slideElements[currentSlideIndex].classList.remove('active');
    if (dotElements[currentSlideIndex]) dotElements[currentSlideIndex].classList.remove('active');

    currentSlideIndex = (currentSlideIndex + 1) % slideElements.length;

    slideElements[currentSlideIndex].classList.add('active');
    if (dotElements[currentSlideIndex]) dotElements[currentSlideIndex].classList.add('active');

    updateHeroTitle();
}

function goToSlide(index) {
    const slideElements = document.querySelectorAll('.hero-slideshow .slide');
    const dotElements = document.querySelectorAll('.slide-controls .dot');
    if (!slideElements.length || index < 0 || index >= slideElements.length) return;

    slideElements[currentSlideIndex].classList.remove('active');
    if (dotElements[currentSlideIndex]) dotElements[currentSlideIndex].classList.remove('active');

    currentSlideIndex = index;

    slideElements[currentSlideIndex].classList.add('active');
    if (dotElements[currentSlideIndex]) dotElements[currentSlideIndex].classList.add('active');

    updateHeroTitle();
}

function updateHeroTitle() {
    const heroCaption = document.getElementById('hero-project-name');
    if (!heroCaption || !activeHeroSlides[currentSlideIndex]) return;

    heroCaption.classList.remove('visible');
    setTimeout(() => {
        if (activeHeroSlides[currentSlideIndex]) {
            heroCaption.textContent = activeHeroSlides[currentSlideIndex].title || '';
            heroCaption.classList.add('visible');
        }
    }, 350);
}

function restartInterval(speed = 5000) {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, speed);
}

// Render Hero Slideshow from data
function renderHero(hero) {
    const slideshowContainer = document.querySelector('.hero-slideshow');
    const controlsContainer = document.querySelector('.slide-controls');
    if (!slideshowContainer || !controlsContainer) return;

    const slides = (hero && hero.slides && hero.slides.length) ? hero.slides : [];
    if (!slides.length) return;

    slideshowContainer.innerHTML = slides.map((s, idx) => `
        <div class="slide ${idx === 0 ? 'active' : ''}" style="background-image: url('${escapeHtml(s.image)}')"></div>
    `).join('');

    controlsContainer.innerHTML = slides.map((s, idx) => `
        <div class="dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></div>
    `).join('');

    initSlideshow(slides, hero.autoplaySpeed || 5000);
}

// Render Projects from data
function renderProjects(projects) {
    const container = document.querySelector('#projects .container');
    if (!container) return;

    if (!projects || !projects.length) {
        container.innerHTML = '<h2 class="section-title">PROJECTS</h2><p style="text-align:center;">No projects found.</p>';
        return;
    }

    // Group projects by category
    const categories = {};
    projects.forEach(p => {
        const cat = (p.category || 'PROJECTS').toUpperCase().trim();
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(p);
    });

    let html = '<h2 class="section-title">PROJECTS</h2>';

    for (const [catName, list] of Object.entries(categories)) {
        html += `
        <div class="project-category">
            <h3 class="category-title">${escapeHtml(catName)}</h3>
            <div class="project-grid">
                ${list.map(p => `
                    <div class="project-card" onclick="openGallery('${escapeHtml(p.id)}', '${escapeHtml(p.name)}')">
                        <div class="card-image-container">
                            <div class="card-image" style="background-image: url('${escapeHtml(p.coverImage)}')"></div>
                            <div class="card-overlay">
                                <span>View Gallery</span>
                            </div>
                        </div>
                        <h4 class="card-title">${escapeHtml(p.name)}</h4>
                    </div>
                `).join('')}
            </div>
        </div>`;
    }

    container.innerHTML = html;
}

// Render About section
function renderAbout(about) {
    const container = document.querySelector('#about .container');
    if (!container || !about) return;

    let html = `<h2 class="section-title">${escapeHtml(about.title || 'ABOUT US')}</h2><div class="about-content">`;
    (about.paragraphs || []).forEach(para => {
        html += `<p>${escapeHtml(para)}</p>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// Render Contact section
function renderContact(contact) {
    const container = document.querySelector('#contact .container');
    if (!container || !contact) return;

    container.innerHTML = `
        <h2 class="section-title">${escapeHtml(contact.title || 'CONTACT US')}</h2>
        <div class="contact-info">
            ${contact.phone ? `<p><strong>Phone:</strong> ${escapeHtml(contact.phone)}</p>` : ''}
            ${contact.email ? `<p><strong>Email:</strong> ${escapeHtml(contact.email)}</p>` : ''}
            ${contact.instagram ? `<p><strong>Instagram:</strong> ${escapeHtml(contact.instagram)}</p>` : ''}
        </div>
    `;
}

// Render Footer
function renderFooter(footerData) {
    const footerContainer = document.querySelector('footer .container');
    if (!footerContainer || !footerData) return;

    footerContainer.innerHTML = `
        <p>${escapeHtml(footerData.text || '© 2024 Design Harvest Consultants. All rights reserved.')}</p>
        <p><a href="admin.html" class="footer-admin-link">⚙ Admin Dashboard</a></p>
    `;
}

// --- Gallery Modal with Slideshow ---
const modal = document.getElementById('gallery-modal');
const modalTitle = document.getElementById('modal-title');
const galleryImage = document.getElementById('gallery-current-image');
const galleryCounter = document.getElementById('gallery-counter-text');

let currentGalleryImages = [];
let currentGalleryIndex = 0;

window.openGallery = function(projectId, fallbackName) {
    const siteData = getActiveSiteData();
    let project = null;

    if (siteData && siteData.projects) {
        project = siteData.projects.find(p => p.id === projectId);
    }

    if (project && project.images && project.images.length) {
        currentGalleryImages = project.images;
        if (modalTitle) modalTitle.textContent = project.name || fallbackName;
    } else {
        alert("Images for this project are currently unavailable.");
        return;
    }

    currentGalleryIndex = 0;
    showGalleryImage();

    if (modal) {
        modal.style.display = "block";
        document.body.style.overflow = "hidden";
    }
};

function showGalleryImage() {
    if (!galleryImage || !currentGalleryImages.length) return;

    galleryImage.style.opacity = 0;

    setTimeout(() => {
        galleryImage.src = currentGalleryImages[currentGalleryIndex];
        galleryImage.onload = () => {
            galleryImage.style.opacity = 1;
        };
        if (galleryCounter) {
            galleryCounter.textContent = (currentGalleryIndex + 1) + ' / ' + currentGalleryImages.length;
        }
    }, 180);
}

window.nextImage = function() {
    if (!currentGalleryImages.length) return;
    currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
    showGalleryImage();
};

window.prevImage = function() {
    if (!currentGalleryImages.length) return;
    currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
    showGalleryImage();
};

window.closeGallery = function() {
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
};

// Close modal on background click
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        closeGallery();
    }
});

// Keyboard navigation for gallery
document.addEventListener('keydown', function(e) {
    if (modal && modal.style.display === 'block') {
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'Escape') closeGallery();
    }
});

// --- Smooth Scrolling for Navigation ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// --- Mobile Hamburger Menu ---
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('mobile-open');
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('mobile-open');
        });
    });
}

// --- Initialize Page on DOM Load ---
document.addEventListener('DOMContentLoaded', () => {
    currentSiteData = getActiveSiteData();
    if (currentSiteData) {
        applyTheme(currentSiteData.theme);
        renderHero(currentSiteData.hero);
        renderProjects(currentSiteData.projects);
        renderAbout(currentSiteData.about);
        renderContact(currentSiteData.contact);
        renderFooter(currentSiteData.footer);
    }
});
