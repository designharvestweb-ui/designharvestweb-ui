// --- Slideshow Logic ---
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;
let slideInterval;

const slideTitles = [
    "SANCTUM ONE GRACE",
    "AL KARIM UNIVERSITY",
    "SANCTUM ONE GRACE",
    "THE NOSTALGIA",
    "DESIGN HARVEST",
    "HAPPY HOMES",
    "THE NOSTALGIA",
    "SANCTUM ONE GRACE"
];
const heroProjectName = document.getElementById('hero-project-name');

function initSlideshow() {
    if (slides.length > 0) {
        slideInterval = setInterval(nextSlide, 5000);
        // Make initial caption visible
        if (heroProjectName) {
            setTimeout(() => heroProjectName.classList.add('visible'), 500);
        }
    }
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            resetInterval();
        });
    });
}

function nextSlide() {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = (currentSlide + 1) % slides.length;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    updateHeroTitle();
}

function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    updateHeroTitle();
}

function updateHeroTitle() {
    if (heroProjectName) {
        heroProjectName.classList.remove('visible');
        
        setTimeout(() => {
            heroProjectName.textContent = slideTitles[currentSlide];
            heroProjectName.classList.add('visible');
        }, 400);
    }
}

function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
}

initSlideshow();

// --- Smooth Scrolling ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// --- Gallery Modal with Slideshow ---
const projectImages = {
    sanctum: [
        'projects/sanctum one grace/1.jpeg',
        'projects/sanctum one grace/1g _.png',
        'projects/sanctum one grace/2.jpeg',
        'projects/sanctum one grace/2g.png',
        'projects/sanctum one grace/OAT.png',
        'projects/sanctum one grace/podium pool_.png',
        'projects/sanctum one grace/terrace 1.png',
        'projects/sanctum one grace/terrace 3.png',
        'projects/sanctum one grace/terrace_.png'
    ],
    urbana: [
        'projects/urbana a4(residential)/WhatsApp Image 2026-03-05 at 01.57.27.jpeg',
        'projects/urbana a4(residential)/WhatsApp Image 2026-03-05 at 01.57.28.jpeg',
        'projects/urbana a4(residential)/WhatsApp Image 2026-03-05 at 01.57.29.jpeg',
        'projects/urbana a4(residential)/WhatsApp Image 2026-03-05 at 01.57.30.jpeg',
        'projects/urbana a4(residential)/WhatsApp Image 2026-03-05 at 01.57.31.jpeg'
    ],
    alkarim: [
        'projects/al karim university( comericial)/1_garden.jpg',
        'projects/al karim university( comericial)/2_playground.jpg',
        'projects/al karim university( comericial)/3_pet area.jpg',
        'projects/al karim university( comericial)/4_outdoor mess.jpg',
        'projects/al karim university( comericial)/5_entrance area.jpg',
        'projects/al karim university( comericial)/6_residential play area.jpg',
        'projects/al karim university( comericial)/7_central lawn area.jpg',
        'projects/al karim university( comericial)/landscape with legend.jpg'
    ],
    nostalgia: [
        'projects/the nostalgia(commercial)/1v.png',
        'projects/the nostalgia(commercial)/2 view.png',
        'projects/the nostalgia(commercial)/3 view.png',
        'projects/the nostalgia(commercial)/4view.png'
    ],
    happy: [
        'projects/happy homes v/GAZEBO_SEATING_VIEW_002_TWILIGHT_2025.05.19_HIRES_1.jpg',
        'projects/happy homes v/HAPPY HOMES_PH-II_LANDSCAPE GROUND 12.2.jpg',
        'projects/happy homes v/POND_VIEW_002_DAY_2025.05.19_HIRES.jpg',
        'projects/happy homes v/YOGA_AREA_VIEW_001_DAY_2025.05.19_HIRES.jpg'
    ]
};

const modal = document.getElementById('gallery-modal');
const modalTitle = document.getElementById('modal-title');
const galleryImage = document.getElementById('gallery-current-image');
const galleryCounter = document.getElementById('gallery-counter-text');

let currentGalleryImages = [];
let currentGalleryIndex = 0;

window.openGallery = function(project, projectName) {
    currentGalleryImages = projectImages[project];
    
    if (!currentGalleryImages || currentGalleryImages.length === 0) {
        alert("Images for this project are currently unavailable.");
        return;
    }

    currentGalleryIndex = 0;
    
    if (modalTitle && projectName) {
        modalTitle.textContent = projectName;
    }
    
    showGalleryImage();
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function showGalleryImage() {
    galleryImage.style.opacity = 0;
    
    setTimeout(() => {
        galleryImage.src = currentGalleryImages[currentGalleryIndex];
        galleryImage.onload = () => {
            galleryImage.style.opacity = 1;
        };
        galleryCounter.textContent = (currentGalleryIndex + 1) + ' / ' + currentGalleryImages.length;
    }, 200);
}

window.nextImage = function() {
    currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
    showGalleryImage();
}

window.prevImage = function() {
    currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
    showGalleryImage();
}

window.closeGallery = function() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
}

// Close modal on background click
window.addEventListener('click', function(event) {
    if (event.target == modal) {
        closeGallery();
    }
});

// Keyboard navigation for gallery
document.addEventListener('keydown', function(e) {
    if (modal.style.display === 'block') {
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'Escape') closeGallery();
    }
});
