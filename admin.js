// Design Harvest Consultants - Admin Dashboard Logic

// All known existing website images for quick selection
const KNOWN_WEBSITE_IMAGES = [
    "assets/images/hero-1.png",
    "assets/images/hero-2.jpg",
    "assets/images/hero-3.png",
    "assets/images/hero-4.png",
    "assets/images/hero-5.jpg",
    "assets/images/hero-6.jpg",
    "assets/images/hero-7.png",
    "assets/images/hero-8.png",
    "assets/images/logo-1.png",
    "assets/images/logo-2.png",
    "projects/al-karim-university/landscape-with-legend.jpg",
    "projects/al-karim-university/1_garden.jpg",
    "projects/al-karim-university/2_playground.jpg",
    "projects/al-karim-university/3_pet-area.jpg",
    "projects/al-karim-university/4_outdoor-mess.jpg",
    "projects/al-karim-university/5_entrance-area.jpg",
    "projects/al-karim-university/6_residential-play-area.jpg",
    "projects/al-karim-university/7_central-lawn-area.jpg",
    "projects/al-karim-university/Picture5.png",
    "projects/al-karim-university/Picture6.png",
    "projects/al-karim-university/Picture7.png",
    "projects/al-karim-university/Picture8.png",
    "projects/happy-homes/GAZEBO_SEATING_VIEW_002_TWILIGHT_2025.05.19_HIRES_1.jpg",
    "projects/happy-homes/HAPPY-HOMES_PH-II_LANDSCAPE-GROUND-12.2.jpg",
    "projects/happy-homes/POND_VIEW_002_DAY_2025.05.19_HIRES.jpg",
    "projects/happy-homes/YOGA_AREA_VIEW_001_DAY_2025.05.19_HIRES.jpg",
    "projects/sanctum-one-grace/1.jpeg",
    "projects/sanctum-one-grace/1g.png",
    "projects/sanctum-one-grace/2.jpeg",
    "projects/sanctum-one-grace/2g.png",
    "projects/sanctum-one-grace/OAT.png",
    "projects/sanctum-one-grace/podium-pool_.png",
    "projects/sanctum-one-grace/terrace-1.png",
    "projects/sanctum-one-grace/terrace-3.png",
    "projects/sanctum-one-grace/terrace_.png",
    "projects/the-nostalgia/1v.png",
    "projects/the-nostalgia/2-view.png",
    "projects/the-nostalgia/3-view.png",
    "projects/the-nostalgia/4view.png",
    "projects/the-nostalgia/Picture1.png",
    "projects/the-nostalgia/Picture2.png",
    "projects/the-nostalgia/Picture3.png",
    "projects/the-nostalgia/Picture4.png",
    "projects/urbana-a4/WhatsApp-Image-2026-03-05-at-01.57.27.jpeg",
    "projects/urbana-a4/WhatsApp-Image-2026-03-05-at-01.57.28.jpeg",
    "projects/urbana-a4/WhatsApp-Image-2026-03-05-at-01.57.29.jpeg",
    "projects/urbana-a4/WhatsApp-Image-2026-03-05-at-01.57.30.jpeg",
    "projects/urbana-a4/WhatsApp-Image-2026-03-05-at-01.57.31.jpeg"
];

// Deep clone helper
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Client-side image compressor: converts large phone/camera images into lightweight ~150-250KB WebP/JPEG data URLs
function compressImageFile(file, maxWidth = 1920, quality = 0.82) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Convert to compressed jpeg data URL
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Escape HTML
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Toast notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : (type === 'danger' ? '⚠️' : 'ℹ️');
    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Current Working State
let adminState = null;

// Load state from localStorage or window.DEFAULT_SITE_DATA
function loadAdminState() {
    try {
        const stored = localStorage.getItem('design_harvest_site_data');
        if (stored) {
            adminState = JSON.parse(stored);
        }
    } catch (e) {
        console.error(e);
    }
    if (!adminState) {
        adminState = deepClone(window.DEFAULT_SITE_DATA || {});
    }
}

// Save state to localStorage
function saveAdminState(showNotification = true) {
    try {
        // Collect latest text inputs
        syncInputsToState();
        localStorage.setItem('design_harvest_site_data', JSON.stringify(adminState));
        if (showNotification) {
            showToast('Changes saved successfully! Open Live Site to view.');
        }
    } catch (e) {
        console.error(e);
        showToast('Error saving changes to browser storage.', 'danger');
    }
}

// Sync Form Fields to adminState
function syncInputsToState() {
    if (!adminState) return;

    // Theme
    if (!adminState.theme) adminState.theme = {};
    adminState.theme.bgColor = document.getElementById('theme-bg-hex').value.trim();
    adminState.theme.darkBg = document.getElementById('theme-dark-bg-hex').value.trim();
    adminState.theme.primaryGold = document.getElementById('theme-gold-hex').value.trim();
    adminState.theme.textColor = document.getElementById('theme-text-hex').value.trim();

    // Hero speed
    if (!adminState.hero) adminState.hero = { slides: [] };
    const speedSelect = document.getElementById('hero-speed-select');
    if (speedSelect) adminState.hero.autoplaySpeed = parseInt(speedSelect.value, 10) || 5000;

    // About
    if (!adminState.about) adminState.about = { paragraphs: [] };
    const aboutTitleInput = document.getElementById('text-title-about');
    if (aboutTitleInput) adminState.about.title = aboutTitleInput.value.trim();

    const paraTextareas = document.querySelectorAll('.about-para-input');
    const paras = [];
    paraTextareas.forEach(t => {
        if (t.value.trim()) paras.push(t.value.trim());
    });
    adminState.about.paragraphs = paras;

    // Contact
    if (!adminState.contact) adminState.contact = {};
    const contactTitle = document.getElementById('text-title-contact');
    if (contactTitle) adminState.contact.title = contactTitle.value.trim();
    adminState.contact.phone = document.getElementById('contact-phone').value.trim();
    adminState.contact.email = document.getElementById('contact-email').value.trim();
    adminState.contact.instagram = document.getElementById('contact-instagram').value.trim();

    // Footer
    if (!adminState.footer) adminState.footer = {};
    adminState.footer.text = document.getElementById('footer-text').value.trim();
}

// ===== TAB 1: THEME & COLORS RENDERER =====
function initThemeTab() {
    const bgPicker = document.getElementById('theme-bg');
    const bgHex = document.getElementById('theme-bg-hex');
    const darkBgPicker = document.getElementById('theme-dark-bg');
    const darkBgHex = document.getElementById('theme-dark-bg-hex');
    const goldPicker = document.getElementById('theme-gold');
    const goldHex = document.getElementById('theme-gold-hex');
    const textPicker = document.getElementById('theme-text');
    const textHex = document.getElementById('theme-text-hex');

    const theme = adminState.theme || {};

    function updatePreview() {
        const preview = document.getElementById('theme-live-preview');
        const bg = bgHex.value;
        const gold = goldHex.value;
        const text = textHex.value;
        if (preview) {
            preview.style.backgroundColor = bg;
            preview.style.color = text;
            const h4 = preview.querySelector('h4');
            const p = preview.querySelector('p');
            const btn = preview.querySelector('button');
            if (h4) h4.style.color = gold;
            if (p) p.style.color = text;
            if (btn) {
                btn.style.backgroundColor = gold;
                btn.style.color = bg;
            }
        }
    }

    function bindColorPair(picker, textInput, defaultVal) {
        picker.value = defaultVal || '#000000';
        textInput.value = defaultVal || '#000000';

        picker.addEventListener('input', () => {
            textInput.value = picker.value.toUpperCase();
            updatePreview();
        });

        textInput.addEventListener('input', () => {
            let val = textInput.value.trim();
            if (!val.startsWith('#') && val.length > 0) val = '#' + val;
            if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                picker.value = val;
            }
            updatePreview();
        });
    }

    bindColorPair(bgPicker, bgHex, theme.bgColor || '#0A0A0A');
    bindColorPair(darkBgPicker, darkBgHex, theme.darkBg || '#111111');
    bindColorPair(goldPicker, goldHex, theme.primaryGold || '#C5A55A');
    bindColorPair(textPicker, textHex, theme.textColor || '#C5A55A');
    updatePreview();

    // Preset theme buttons
    document.querySelectorAll('.preset-chip').forEach(btn => {
        btn.onclick = () => {
            const bg = btn.dataset.bg;
            const dark = btn.dataset.dark;
            const gold = btn.dataset.gold;
            const text = btn.dataset.text;

            bgPicker.value = bg;
            bgHex.value = bg;
            darkBgPicker.value = dark;
            darkBgHex.value = dark;
            goldPicker.value = gold;
            goldHex.value = gold;
            textPicker.value = text;
            textHex.value = text;

            updatePreview();
            showToast(`Applied preset: ${btn.textContent.trim()}`);
        };
    });

    // Reset button
    const resetBtn = document.getElementById('btn-reset-theme');
    if (resetBtn) {
        resetBtn.onclick = () => {
            const def = (window.DEFAULT_SITE_DATA && window.DEFAULT_SITE_DATA.theme) || {};
            bgPicker.value = def.bgColor || '#0A0A0A';
            bgHex.value = def.bgColor || '#0A0A0A';
            darkBgPicker.value = def.darkBg || '#111111';
            darkBgHex.value = def.darkBg || '#111111';
            goldPicker.value = def.primaryGold || '#C5A55A';
            goldHex.value = def.primaryGold || '#C5A55A';
            textPicker.value = def.textColor || '#C5A55A';
            textHex.value = def.textColor || '#C5A55A';
            updatePreview();
            showToast('Colors reset to factory defaults.');
        };
    }
}

// ===== TAB 2: HERO SLIDESHOW RENDERER =====
function renderHeroTab() {
    const container = document.getElementById('slides-container');
    const speedSelect = document.getElementById('hero-speed-select');
    if (!container) return;

    if (speedSelect && adminState.hero) {
        speedSelect.value = String(adminState.hero.autoplaySpeed || 5000);
    }

    const slides = (adminState.hero && adminState.hero.slides) ? adminState.hero.slides : [];

    if (!slides.length) {
        container.innerHTML = '<p style="color:var(--text-muted);">No slides currently configured.</p>';
        return;
    }

    container.innerHTML = slides.map((slide, idx) => `
        <div class="slide-row-card" data-index="${idx}">
            <div class="slide-thumb" style="background-image: url('${escapeHtml(slide.image)}')" title="Click to replace image" onclick="openImageModalForHero(${idx})"></div>
            <div class="slide-info">
                <label style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Slide #${idx + 1} Caption / Title</label>
                <input type="text" class="form-input slide-title-input" value="${escapeHtml(slide.title || '')}" oninput="updateSlideTitle(${idx}, this.value)" placeholder="PROJECT NAME">
            </div>
            <div class="slide-actions">
                <button class="btn btn-outline btn-sm" onclick="openImageModalForHero(${idx})" title="Change image">🖼 Replace</button>
                <button class="btn btn-outline btn-sm" onclick="moveSlide(${idx}, -1)" ${idx === 0 ? 'disabled style="opacity:0.3;"' : ''} title="Move Up">▲</button>
                <button class="btn btn-outline btn-sm" onclick="moveSlide(${idx}, 1)" ${idx === slides.length - 1 ? 'disabled style="opacity:0.3;"' : ''} title="Move Down">▼</button>
                <button class="btn btn-danger btn-sm" onclick="deleteSlide(${idx})" title="Delete slide">🗑</button>
            </div>
        </div>
    `).join('');
}

window.updateSlideTitle = function(index, newTitle) {
    if (adminState.hero && adminState.hero.slides[index]) {
        adminState.hero.slides[index].title = newTitle;
    }
};

window.moveSlide = function(index, direction) {
    const slides = adminState.hero.slides;
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const temp = slides[index];
    slides[index] = slides[target];
    slides[target] = temp;
    renderHeroTab();
};

window.deleteSlide = function(index) {
    if (adminState.hero.slides.length <= 1) {
        alert('You must have at least one hero slide.');
        return;
    }
    if (confirm('Are you sure you want to delete this slide?')) {
        adminState.hero.slides.splice(index, 1);
        renderHeroTab();
        showToast('Slide removed.');
    }
};

// Add slide button
document.getElementById('btn-add-slide').onclick = () => {
    openImageModal('Add New Slide Image', (chosenImg) => {
        if (!chosenImg) return;
        const newTitle = prompt('Enter slide title / project name:', 'NEW PROJECT');
        if (!adminState.hero) adminState.hero = { slides: [] };
        adminState.hero.slides.push({
            id: 'slide-' + Date.now(),
            image: chosenImg,
            title: (newTitle || 'DESIGN HARVEST').toUpperCase().trim()
        });
        renderHeroTab();
        showToast('New slide added!');
    });
};

window.openImageModalForHero = function(slideIndex) {
    openImageModal(`Replace Slide #${slideIndex + 1} Image`, (chosenImg) => {
        if (chosenImg && adminState.hero && adminState.hero.slides[slideIndex]) {
            adminState.hero.slides[slideIndex].image = chosenImg;
            renderHeroTab();
            showToast(`Slide #${slideIndex + 1} image updated!`);
        }
    });
};

// ===== TAB 3: PROJECTS & GALLERIES RENDERER =====
function renderProjectsTab() {
    const container = document.getElementById('projects-accordion-container');
    if (!container) return;

    const projects = adminState.projects || [];
    if (!projects.length) {
        container.innerHTML = '<p style="color:var(--text-muted);">No projects found.</p>';
        return;
    }

    container.innerHTML = projects.map((p, pIdx) => `
        <div class="project-accordion-item" id="proj-card-${pIdx}">
            <div class="project-accordion-header" onclick="toggleProjectAccordion(${pIdx})">
                <div class="project-header-left">
                    <div class="project-cover-mini" style="background-image: url('${escapeHtml(p.coverImage)}')"></div>
                    <div>
                        <div class="project-header-title">${escapeHtml(p.name)}</div>
                        <span class="project-category-badge">${escapeHtml(p.category || 'RESIDENTIAL')}</span>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <span style="font-size:0.8rem; color:var(--text-muted);">${(p.images || []).length} photos</span>
                    <span class="accordion-arrow" id="arrow-${pIdx}">▼</span>
                </div>
            </div>
            <div class="project-accordion-body" id="proj-body-${pIdx}">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div class="form-group">
                        <label class="form-label">Project Name</label>
                        <input type="text" class="form-input" value="${escapeHtml(p.name)}" oninput="updateProjectProp(${pIdx}, 'name', this.value.toUpperCase())">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <select class="form-select" onchange="updateProjectProp(${pIdx}, 'category', this.value)">
                            <option value="RESIDENTIAL" ${p.category === 'RESIDENTIAL' ? 'selected' : ''}>RESIDENTIAL</option>
                            <option value="COMMERCIAL" ${p.category === 'COMMERCIAL' ? 'selected' : ''}>COMMERCIAL</option>
                            <option value="HOSPITALITY" ${p.category === 'HOSPITALITY' ? 'selected' : ''}>HOSPITALITY</option>
                            <option value="INSTITUTIONAL" ${p.category === 'INSTITUTIONAL' ? 'selected' : ''}>INSTITUTIONAL</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Cover Thumbnail Image</label>
                        <div style="display:flex; gap:8px;">
                            <button class="btn btn-outline btn-sm" style="flex:1;" onclick="replaceProjectCover(${pIdx})">
                                🖼 Replace Cover
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card-header" style="margin-top:1.5rem; margin-bottom:0.8rem; padding-bottom:0.5rem;">
                    <h4 style="font-size:1rem;">Gallery Images (${(p.images || []).length})</h4>
                    <div style="display:flex; gap:8px;">
                        <button class="btn btn-outline btn-sm" onclick="addImageToProject(${pIdx})">➕ Add Single Image</button>
                        <label class="btn btn-primary btn-sm" style="cursor:pointer;">
                            ➕ Upload Multiple Photos
                            <input type="file" multiple accept="image/*" style="display:none;" onchange="uploadMultiplePhotos(${pIdx}, this)">
                        </label>
                    </div>
                </div>

                <div class="gallery-manager-grid">
                    ${(p.images || []).map((imgUrl, imgIdx) => `
                        <div class="gallery-item-card" style="background-image: url('${escapeHtml(imgUrl)}')">
                            <div class="gallery-item-overlay">
                                <button class="gallery-btn-action" onclick="moveGalleryPhoto(${pIdx}, ${imgIdx}, -1)" title="Move left">◀</button>
                                <button class="gallery-btn-action" onclick="replaceGalleryPhoto(${pIdx}, ${imgIdx})" title="Replace">🖼</button>
                                <button class="gallery-btn-action delete-btn" onclick="deleteGalleryPhoto(${pIdx}, ${imgIdx})" title="Delete">🗑</button>
                                <button class="gallery-btn-action" onclick="moveGalleryPhoto(${pIdx}, ${imgIdx}, 1)" title="Move right">▶</button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color); display:flex; justify-content: flex-end;">
                    <button class="btn btn-danger btn-sm" onclick="deleteProject(${pIdx})">🗑 Delete Entire Project</button>
                </div>
            </div>
        </div>
    `).join('');
}

window.toggleProjectAccordion = function(pIdx) {
    const item = document.getElementById(`proj-card-${pIdx}`);
    if (item) item.classList.toggle('open');
};

window.updateProjectProp = function(pIdx, prop, value) {
    if (adminState.projects[pIdx]) {
        adminState.projects[pIdx][prop] = value;
    }
};

window.replaceProjectCover = function(pIdx) {
    openImageModal(`Replace Cover Image for ${adminState.projects[pIdx].name}`, (chosen) => {
        if (chosen) {
            adminState.projects[pIdx].coverImage = chosen;
            renderProjectsTab();
            // keep accordion open
            const item = document.getElementById(`proj-card-${pIdx}`);
            if (item) item.classList.add('open');
            showToast('Cover photo updated.');
        }
    });
};

window.addImageToProject = function(pIdx) {
    openImageModal(`Add Photo to ${adminState.projects[pIdx].name}`, (chosen) => {
        if (chosen) {
            if (!adminState.projects[pIdx].images) adminState.projects[pIdx].images = [];
            adminState.projects[pIdx].images.push(chosen);
            renderProjectsTab();
            const item = document.getElementById(`proj-card-${pIdx}`);
            if (item) item.classList.add('open');
            showToast('Photo added to project gallery.');
        }
    });
};

window.uploadMultiplePhotos = async function(pIdx, input) {
    if (!input.files || !input.files.length) return;
    showToast(`Compressing &amp; uploading ${input.files.length} images...`);
    const files = Array.from(input.files);
    for (const file of files) {
        try {
            const compressed = await compressImageFile(file);
            adminState.projects[pIdx].images.push(compressed);
        } catch (e) {
            console.error('Failed to compress image', file.name, e);
        }
    }
    renderProjectsTab();
    const item = document.getElementById(`proj-card-${pIdx}`);
    if (item) item.classList.add('open');
    showToast(`Added ${files.length} photos successfully!`);
    input.value = '';
};

window.replaceGalleryPhoto = function(pIdx, imgIdx) {
    openImageModal(`Replace Photo #${imgIdx + 1}`, (chosen) => {
        if (chosen) {
            adminState.projects[pIdx].images[imgIdx] = chosen;
            renderProjectsTab();
            const item = document.getElementById(`proj-card-${pIdx}`);
            if (item) item.classList.add('open');
            showToast('Photo replaced.');
        }
    });
};

window.deleteGalleryPhoto = function(pIdx, imgIdx) {
    if (confirm('Delete this photo from gallery?')) {
        adminState.projects[pIdx].images.splice(imgIdx, 1);
        renderProjectsTab();
        const item = document.getElementById(`proj-card-${pIdx}`);
        if (item) item.classList.add('open');
        showToast('Photo removed.');
    }
};

window.moveGalleryPhoto = function(pIdx, imgIdx, direction) {
    const images = adminState.projects[pIdx].images;
    const target = imgIdx + direction;
    if (target < 0 || target >= images.length) return;
    const temp = images[imgIdx];
    images[imgIdx] = images[target];
    images[target] = temp;
    renderProjectsTab();
    const item = document.getElementById(`proj-card-${pIdx}`);
    if (item) item.classList.add('open');
};

window.deleteProject = function(pIdx) {
    const p = adminState.projects[pIdx];
    if (confirm(`Are you sure you want to permanently delete project "${p.name}"?`)) {
        adminState.projects.splice(pIdx, 1);
        renderProjectsTab();
        showToast('Project deleted.');
    }
};

// Add new project button
document.getElementById('btn-add-project').onclick = () => {
    const name = prompt('Enter Project Name:', 'NEW PROJECT');
    if (!name || !name.trim()) return;
    const category = prompt('Enter Category (RESIDENTIAL or COMMERCIAL):', 'RESIDENTIAL');
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    openImageModal(`Select Cover Image for ${name}`, (chosenCover) => {
        const cover = chosenCover || 'assets/images/hero-1.png';
        adminState.projects.push({
            id: slug || ('project-' + Date.now()),
            name: name.toUpperCase().trim(),
            category: (category || 'RESIDENTIAL').toUpperCase().trim(),
            coverImage: cover,
            images: [cover]
        });
        renderProjectsTab();
        showToast(`Project "${name}" created!`);
    });
};

// ===== TAB 4: TEXTS & ABOUT US RENDERER =====
function renderTextsTab() {
    const about = adminState.about || {};
    const contact = adminState.contact || {};
    const footer = adminState.footer || {};

    // Titles
    document.getElementById('text-title-about').value = about.title || 'ABOUT US';
    document.getElementById('text-title-contact').value = contact.title || 'CONTACT US';

    // Contact
    document.getElementById('contact-phone').value = contact.phone || '';
    document.getElementById('contact-email').value = contact.email || '';
    document.getElementById('contact-instagram').value = contact.instagram || '';

    // Footer
    document.getElementById('footer-text').value = footer.text || '';

    // Paragraphs
    renderAboutParagraphs();
}

function renderAboutParagraphs() {
    const container = document.getElementById('about-paragraphs-container');
    if (!container) return;

    const paras = (adminState.about && adminState.about.paragraphs) ? adminState.about.paragraphs : [];
    container.innerHTML = paras.map((p, idx) => `
        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:6px; padding:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <label style="font-size:0.8rem; color:var(--primary-gold);">Paragraph #${idx + 1}</label>
                <div style="display:flex; gap:6px;">
                    <button class="btn btn-outline btn-sm" onclick="moveParagraph(${idx}, -1)" ${idx === 0 ? 'disabled style="opacity:0.3;"' : ''}>▲</button>
                    <button class="btn btn-outline btn-sm" onclick="moveParagraph(${idx}, 1)" ${idx === paras.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>▼</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteParagraph(${idx})">🗑</button>
                </div>
            </div>
            <textarea class="form-textarea about-para-input" rows="3">${escapeHtml(p)}</textarea>
        </div>
    `).join('');
}

window.moveParagraph = function(idx, direction) {
    syncInputsToState();
    const paras = adminState.about.paragraphs;
    const target = idx + direction;
    if (target < 0 || target >= paras.length) return;
    const temp = paras[idx];
    paras[idx] = paras[target];
    paras[target] = temp;
    renderAboutParagraphs();
};

window.deleteParagraph = function(idx) {
    syncInputsToState();
    if (confirm('Delete this paragraph?')) {
        adminState.about.paragraphs.splice(idx, 1);
        renderAboutParagraphs();
        showToast('Paragraph deleted.');
    }
};

document.getElementById('btn-add-paragraph').onclick = () => {
    syncInputsToState();
    if (!adminState.about) adminState.about = { paragraphs: [] };
    adminState.about.paragraphs.push('Write your new paragraph text here...');
    renderAboutParagraphs();
};

// ===== TAB 5: GITHUB EXPORT & BACKUPS =====
function initExportTab() {
    // ===== DIRECT GITHUB PUBLISHING VIA REST API =====
    const tokenInput = document.getElementById('gh-token-input');
    const repoInput = document.getElementById('gh-repo-input');
    const branchInput = document.getElementById('gh-branch-input');
    const statusBadge = document.getElementById('gh-status-badge');

    function getGitHubConfig() {
        return {
            token: localStorage.getItem('dh_gh_token') || '',
            repo: localStorage.getItem('dh_gh_repo') || 'designharvestweb-ui/designharvestweb-ui',
            branch: localStorage.getItem('dh_gh_branch') || 'main'
        };
    }

    function updateBadge() {
        const cfg = getGitHubConfig();
        if (cfg.token && cfg.repo) {
            if (statusBadge) {
                statusBadge.textContent = 'Configured (' + cfg.repo + ')';
                statusBadge.style.color = 'var(--success)';
                statusBadge.style.borderColor = 'var(--success)';
            }
        } else {
            if (statusBadge) {
                statusBadge.textContent = 'Setup Required';
                statusBadge.style.color = 'var(--primary-gold)';
                statusBadge.style.borderColor = 'var(--border-color)';
            }
        }
    }

    // Populate inputs from saved config
    const currentCfg = getGitHubConfig();
    if (tokenInput) tokenInput.value = currentCfg.token;
    if (repoInput) repoInput.value = currentCfg.repo;
    if (branchInput) branchInput.value = currentCfg.branch;
    updateBadge();

    // Save GitHub Settings
    const saveGhBtn = document.getElementById('btn-save-gh-config');
    if (saveGhBtn) {
        saveGhBtn.onclick = () => {
            const token = tokenInput ? tokenInput.value.trim() : '';
            const repo = repoInput ? repoInput.value.trim() : '';
            const branch = branchInput ? (branchInput.value.trim() || 'main') : 'main';

            localStorage.setItem('dh_gh_token', token);
            localStorage.setItem('dh_gh_repo', repo);
            localStorage.setItem('dh_gh_branch', branch);
            updateBadge();
            showToast('GitHub configuration saved!');
        };
    }

    // Test Connection
    const testGhBtn = document.getElementById('btn-test-gh-connection');
    if (testGhBtn) {
        testGhBtn.onclick = async () => {
            const cfg = getGitHubConfig();
            if (!cfg.token || !cfg.repo) {
                alert('Please enter your GitHub Token and Repository name first.');
                return;
            }
            testGhBtn.disabled = true;
            testGhBtn.textContent = 'Testing...';
            try {
                const res = await fetch(`https://api.github.com/repos/${cfg.repo}`, {
                    headers: {
                        'Authorization': `Bearer ${cfg.token}`,
                        'Accept': 'application/vnd.github+json'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    showToast(`Connected to ${data.full_name}! (Permission verified)`);
                    updateBadge();
                } else {
                    const err = await res.json();
                    alert(`Connection Failed: ${err.message || res.statusText}`);
                }
            } catch (e) {
                alert(`Network error connecting to GitHub: ${e.message}`);
            } finally {
                testGhBtn.disabled = false;
                testGhBtn.innerHTML = '<span>🔌</span> Test Connection';
            }
        };
    }

    // Direct 1-Click Publish Function
    async function triggerDirectGitHubPublish() {
        const cfg = getGitHubConfig();
        if (!cfg.token || !cfg.repo) {
            alert('To publish directly to GitHub without downloading anything, please enter your GitHub Token under the "GitHub Export & Backup" tab once.');
            // Switch to tab
            const tabBtn = document.querySelector('[data-tab="tab-export"]');
            if (tabBtn) tabBtn.click();
            return;
        }

        // Save current changes first
        syncInputsToState();
        saveAdminState(false);

        const publishBtns = [
            document.getElementById('btn-publish-github-top'),
            document.getElementById('btn-publish-github-main')
        ];

        publishBtns.forEach(b => {
            if (b) {
                b.disabled = true;
                b.innerHTML = '<span>⏳</span> Publishing to GitHub...';
            }
        });

        try {
            showToast('Publishing directly to GitHub...', 'info');

            const contentString = `// Design Harvest Consultants - Central Data Store\nwindow.DEFAULT_SITE_DATA = ${JSON.stringify(adminState, null, 2)};\n`;
            const path = 'data.js';
            const baseUrl = `https://api.github.com/repos/${cfg.repo}/contents/${path}`;

            // 1. Get SHA if file exists
            let sha = null;
            try {
                const getRes = await fetch(`${baseUrl}?ref=${cfg.branch}`, {
                    headers: {
                        'Authorization': `Bearer ${cfg.token}`,
                        'Accept': 'application/vnd.github+json'
                    }
                });
                if (getRes.ok) {
                    const fileData = await getRes.json();
                    sha = fileData.sha;
                }
            } catch (err) {
                console.warn('Could not check existing file SHA', err);
            }

            // 2. Base64 encode UTF-8
            const base64Content = btoa(unescape(encodeURIComponent(contentString)));

            // 3. Commit to GitHub
            const putBody = {
                message: 'Update website content via Admin Dashboard',
                content: base64Content,
                branch: cfg.branch
            };
            if (sha) {
                putBody.sha = sha;
            }

            const putRes = await fetch(baseUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${cfg.token}`,
                    'Accept': 'application/vnd.github+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(putBody)
            });

            if (putRes.ok) {
                showToast('🎉 Successfully published to GitHub! Live site is updating automatically.');
            } else {
                const errData = await putRes.json();
                alert(`GitHub Publish Failed: ${errData.message || putRes.statusText}`);
            }
        } catch (e) {
            alert(`Error publishing to GitHub: ${e.message}`);
        } finally {
            publishBtns.forEach(b => {
                if (b) {
                    b.disabled = false;
                    b.innerHTML = '<span>🚀</span> Publish to GitHub';
                }
            });
        }
    }

    const publishTopBtn = document.getElementById('btn-publish-github-top');
    const publishMainBtn = document.getElementById('btn-publish-github-main');
    if (publishTopBtn) publishTopBtn.onclick = triggerDirectGitHubPublish;
    if (publishMainBtn) publishMainBtn.onclick = triggerDirectGitHubPublish;

    // Manual Download data.js Fallback
    const downloadDataJs = () => {
        syncInputsToState();
        saveAdminState(false);
        const code = `// Design Harvest Consultants - Central Data Store\nwindow.DEFAULT_SITE_DATA = ${JSON.stringify(adminState, null, 2)};\n`;
        const blob = new Blob([code], { type: 'application/javascript;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Downloaded updated data.js.');
    };

    const downloadBtn = document.getElementById('btn-download-data-js');
    if (downloadBtn) downloadBtn.onclick = downloadDataJs;

    // Export JSON Backup
    const exportJsonBtn = document.getElementById('btn-export-json');
    if (exportJsonBtn) {
        exportJsonBtn.onclick = () => {
            syncInputsToState();
            const json = JSON.stringify(adminState, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `design_harvest_backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Exported configuration backup (JSON).');
        };
    }

    // Import JSON Backup
    const importInput = document.getElementById('import-json-file');
    if (importInput) {
        importInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const parsed = JSON.parse(evt.target.result);
                    if (parsed && typeof parsed === 'object') {
                        adminState = parsed;
                        saveAdminState(true);
                        initThemeTab();
                        renderHeroTab();
                        renderProjectsTab();
                        renderTextsTab();
                        showToast('Configuration imported successfully!');
                    }
                } catch (err) {
                    alert('Invalid JSON file format.');
                }
            };
            reader.readAsText(file);
        };
    }

    // Factory Reset
    const factoryResetBtn = document.getElementById('btn-factory-reset');
    if (factoryResetBtn) {
        factoryResetBtn.onclick = () => {
            if (confirm('Are you sure you want to restore original default settings? This will discard your local changes.')) {
                localStorage.removeItem('design_harvest_site_data');
                adminState = deepClone(window.DEFAULT_SITE_DATA || {});
                initThemeTab();
                renderHeroTab();
                renderProjectsTab();
                renderTextsTab();
                showToast('Website restored to original factory defaults.');
            }
        };
    }
}

// ===== IMAGE PICKER MODAL LOGIC =====
let currentImageCallback = null;

function openImageModal(title, callback) {
    currentImageCallback = callback;
    const modal = document.getElementById('image-modal');
    const modalTitle = document.getElementById('image-modal-title');
    const urlInput = document.getElementById('modal-url-input');
    const existingSelect = document.getElementById('modal-existing-select');

    if (modalTitle) modalTitle.textContent = title || 'Select or Upload Image';
    if (urlInput) urlInput.value = '';

    // Populate existing images dropdown
    if (existingSelect) {
        existingSelect.innerHTML = '<option value="">-- Choose from existing site images --</option>' +
            KNOWN_WEBSITE_IMAGES.map(path => `<option value="${escapeHtml(path)}">${escapeHtml(path)}</option>`).join('');
    }

    if (modal) modal.classList.add('open');
}

window.closeImageModal = function() {
    const modal = document.getElementById('image-modal');
    if (modal) modal.classList.remove('open');
    currentImageCallback = null;
};

// Setup Image Dropzone & File Upload
function initImageModalHandlers() {
    const dropzone = document.getElementById('modal-dropzone');
    const fileInput = document.getElementById('modal-file-input');
    const urlInput = document.getElementById('modal-url-input');
    const existingSelect = document.getElementById('modal-existing-select');
    const confirmBtn = document.getElementById('btn-confirm-image');

    if (dropzone && fileInput) {
        dropzone.onclick = () => fileInput.click();

        dropzone.ondragover = (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        };
        dropzone.ondragleave = () => dropzone.classList.remove('dragover');

        dropzone.ondrop = async (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleUploadedFile(e.dataTransfer.files[0]);
            }
        };

        fileInput.onchange = () => {
            if (fileInput.files && fileInput.files[0]) {
                handleUploadedFile(fileInput.files[0]);
            }
        };
    }

    async function handleUploadedFile(file) {
        showToast('Compressing image...');
        try {
            const compressedDataUrl = await compressImageFile(file);
            if (urlInput) urlInput.value = compressedDataUrl;
            showToast('Image ready to apply!');
        } catch (e) {
            console.error(e);
            alert('Failed to process image file.');
        }
    }

    if (existingSelect) {
        existingSelect.onchange = () => {
            if (existingSelect.value) {
                urlInput.value = existingSelect.value;
            }
        };
    }

    if (confirmBtn) {
        confirmBtn.onclick = () => {
            const chosen = (urlInput.value || '').trim();
            if (!chosen) {
                alert('Please upload an image, enter an image path, or select an existing image.');
                return;
            }
            if (typeof currentImageCallback === 'function') {
                currentImageCallback(chosen);
            }
            closeImageModal();
        };
    }
}

// ===== TAB SWITCHING =====
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    tabButtons.forEach(btn => {
        btn.onclick = () => {
            const targetId = btn.dataset.tab;
            tabButtons.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(targetId);
            if (targetPane) targetPane.classList.add('active');
        };
    });
}

// ===== PASSCODE SECURITY LOGIC =====
const DEFAULT_PASSCODE = '1234567890';

function getAdminPasscode() {
    return localStorage.getItem('dh_admin_passcode') || DEFAULT_PASSCODE;
}

function checkAuthentication() {
    const isAuth = sessionStorage.getItem('dh_admin_authenticated') === 'true';
    const lockScreen = document.getElementById('admin-lock-screen');
    const navbar = document.querySelector('.admin-navbar');
    const layout = document.querySelector('.admin-layout');

    if (isAuth) {
        if (lockScreen) lockScreen.style.display = 'none';
        if (navbar) navbar.style.display = 'flex';
        if (layout) layout.style.display = 'flex';
    } else {
        if (lockScreen) lockScreen.style.display = 'flex';
        if (navbar) navbar.style.display = 'none';
        if (layout) layout.style.display = 'none';
        const input = document.getElementById('lock-passcode');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 150);
        }
    }
}

window.attemptUnlock = function() {
    const input = document.getElementById('lock-passcode');
    const errorMsg = document.getElementById('lock-error-msg');
    const entered = (input ? input.value : '').trim();
    const correct = getAdminPasscode();

    if (entered === correct) {
        sessionStorage.setItem('dh_admin_authenticated', 'true');
        if (errorMsg) errorMsg.style.display = 'none';
        checkAuthentication();
        showToast('Dashboard unlocked! Welcome, Administrator.');
    } else {
        if (errorMsg) errorMsg.style.display = 'block';
        if (input) {
            input.style.borderColor = 'var(--danger)';
            input.focus();
            input.select();
        }
    }
};

window.lockAdminDashboard = function() {
    sessionStorage.removeItem('dh_admin_authenticated');
    checkAuthentication();
    showToast('Dashboard locked.');
};

// Global Save Button
document.getElementById('btn-save-global').onclick = () => {
    saveAdminState(true);
};

// Auto-save on page unload
window.addEventListener('beforeunload', () => {
    syncInputsToState();
    try {
        localStorage.setItem('design_harvest_site_data', JSON.stringify(adminState));
    } catch (e) {}
});

// ===== INITIALIZE ADMIN APP =====
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    loadAdminState();
    initTabNavigation();
    initThemeTab();
    renderHeroTab();
    renderProjectsTab();
    renderTextsTab();
    initExportTab();
    initImageModalHandlers();

    // Lock / Logout button
    const logoutBtn = document.getElementById('btn-admin-logout');
    if (logoutBtn) {
        logoutBtn.onclick = window.lockAdminDashboard;
    }

    // Passcode change handler
    const updatePassBtn = document.getElementById('btn-update-passcode');
    const newPassInput = document.getElementById('new-passcode-input');
    if (updatePassBtn && newPassInput) {
        newPassInput.value = getAdminPasscode();
        updatePassBtn.onclick = () => {
            const val = newPassInput.value.trim();
            if (val.length < 4) {
                alert('Passcode should be at least 4 characters long.');
                return;
            }
            localStorage.setItem('dh_admin_passcode', val);
            showToast('Admin passcode updated successfully!');
        };
    }
});
