/* ═══════════════════════════════════════════════
   Dollar Nong Photography — Main Application
   SPA Router · i18n · Gallery · Lightbox
   ═══════════════════════════════════════════════ */

const App = {
  lang: 'en',
  currentPage: 'home',
  currentCategory: 'all',
  currentImages: [],
  currentIndex: 0,
  pageSize: 20,
  loadedCount: 0,
  images: { portrait: [], event: [], food: [] },
  translations: {},
  admin: { isLoggedIn: false },

  async init() {
    // Load translations
    const resp = await fetch('data/translations.json');
    this.translations = await resp.json();

    // Load gallery data
    await this.loadGalleryData();

    // Detect saved language preference
    const savedLang = localStorage.getItem('dn-lang');
    if (savedLang && this.translations[savedLang]) this.lang = savedLang;

    // Render
    this.render();
    this.bindEvents();
    this.setupLazyLoading();
  },

  async loadGalleryData() {
    try {
      const resp = await fetch('data/portfolio.json');
      const data = await resp.json();
      this.images = data.images || { portrait: [], event: [], food: [] };
    } catch {
      this.images = { portrait: [], event: [], food: [] };
    }
  },

  t(key) {
    const keys = key.split('.');
    let val = this.translations[this.lang];
    for (const k of keys) {
      if (!val) return key;
      val = val[k];
    }
    return val || key;
  },

  render() {
    document.documentElement.lang = this.lang;
    this.renderHeader();
    this.renderPage();
    this.renderFooter();
  },

  renderHeader() {
    const header = document.getElementById('header');
    header.innerHTML = `
      <div class="header-inner">
        <a href="#/" class="header-logo" data-nav="home">Dollar <span>Nong</span></a>
        <nav class="header-nav" id="mainNav">
          <a href="#/" data-nav="home">${this.t('site.nav_home')}</a>
          <a href="#/portrait" data-nav="portrait">${this.t('site.nav_portrait')}</a>
          <a href="#/event" data-nav="event">${this.t('site.nav_event')}</a>
          <a href="#/food" data-nav="food">${this.t('site.nav_food')}</a>
          <a href="#/about" data-nav="about">${this.t('site.nav_about')}</a>
          <a href="#/contact" data-nav="contact">${this.t('site.nav_contact')}</a>
          <button class="lang-btn" id="langBtn">${this.t('site.lang_switch')}</button>
        </nav>
        <button class="mobile-menu-btn" id="mobileMenuBtn">☰</button>
      </div>
    `;
  },

  renderFooter() {
    const footer = document.getElementById('footer');
    footer.innerHTML = `
      <div class="footer">
        <p>${this.t('site.copyright')}</p>
      </div>
    `;
  },

  renderPage() {
    const main = document.getElementById('main');
    const hash = location.hash.slice(1) || '/';
    const parts = hash.split('/');
    const page = parts[1] || 'home';
    const category = parts[1] || 'home';

    // Update active nav
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.classList.toggle('active', el.dataset.nav === (['portrait','event','food','about','contact'].includes(page) ? page : 'home'));
    });

    switch(page) {
      case 'portrait': this.renderGallery(main, 'portrait'); break;
      case 'event': this.renderGallery(main, 'event'); break;
      case 'food': this.renderGallery(main, 'food'); break;
      case 'about': this.renderAbout(main); break;
      case 'contact': this.renderContact(main); break;
      default: this.renderHome(main); break;
    }
  },

  renderHome(main) {
    const images = [...this.images.portrait, ...this.images.event, ...this.images.food];
    main.innerHTML = `
      <section class="hero">
        <img src="images/cover.jpg" alt="Dollar Nong Photography" onerror="this.style.display='none'">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1>${this.t('site.hero_title')}</h1>
          <p>${this.t('site.hero_subtitle')}</p>
        </div>
      </section>
      <section class="section">
        <p class="section-title">${this.t('site.gallery_title')}</p>
        <h2 class="section-heading">${this.t('categories.portrait')} / ${this.t('categories.event')} / ${this.t('categories.food')}</h2>
        <p class="section-desc">${this.t('categories.portrait_desc')} · ${this.t('categories.event_desc')} · ${this.t('categories.food_desc')}</p>
        <div class="category-nav" id="categoryNav">
          <button class="category-btn active" data-cat="all">${this.t('site.gallery_all')}</button>
          <button class="category-btn" data-cat="portrait">${this.t('categories.portrait')}</button>
          <button class="category-btn" data-cat="event">${this.t('categories.event')}</button>
          <button class="category-btn" data-cat="food">${this.t('categories.food')}</button>
        </div>
        <div class="gallery-grid" id="galleryGrid"></div>
        <div class="loading-spinner" id="loadingSpinner"></div>
      </section>
    `;
    this.currentCategory = 'all';
    this.loadedCount = 0;
    this.renderGalleryItems(images);
    this.bindCategoryNav();
    this.bindInfiniteScroll(images);
  },

  renderGallery(main, category) {
    const images = this.images[category] || [];
    main.innerHTML = `
      <div style="height:var(--header-h)"></div>
      <section class="section">
        <p class="section-title">${this.t('gallery_title')}</p>
        <h2 class="section-heading">${this.t('categories.' + category)}</h2>
        <p class="section-desc">${this.t('categories.' + category + '_desc')}</p>
        <div class="gallery-grid" id="galleryGrid"></div>
        <div class="loading-spinner" id="loadingSpinner"></div>
      </section>
    `;
    this.currentCategory = category;
    this.loadedCount = 0;
    this.renderGalleryItems(images);
    this.bindInfiniteScroll(images);
  },

  renderGalleryItems(images) {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    const start = this.loadedCount;
    const end = Math.min(start + this.pageSize, images.length);
    for (let i = start; i < end; i++) {
      const img = images[i];
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.dataset.index = i;
      item.innerHTML = `
        <img src="${img.thumb}" alt="${img.title || ''}" loading="lazy" data-full="${img.full}">
        <div class="gallery-item-overlay"><span>${img.title || ''}</span></div>
      `;
      item.addEventListener('click', () => this.openLightbox(images, i));
      grid.appendChild(item);
    }
    this.loadedCount = end;
    if (end >= images.length) {
      const spinner = document.getElementById('loadingSpinner');
      if (spinner) spinner.style.display = 'none';
    }
    this.setupLazyLoading();
  },

  bindCategoryNav() {
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        const allImages = [...this.images.portrait, ...this.images.event, ...this.images.food];
        const images = cat === 'all' ? allImages : (this.images[cat] || []);
        const grid = document.getElementById('galleryGrid');
        if (grid) grid.innerHTML = '';
        this.loadedCount = 0;
        this.currentCategory = cat;
        this.renderGalleryItems(images);
        this.bindInfiniteScroll(images);
      });
    });
  },

  bindInfiniteScroll(images) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && this.loadedCount < images.length) {
          this.renderGalleryItems(images);
        }
      });
    });
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) observer.observe(spinner);
  },

  renderAbout(main) {
    main.innerHTML = `
      <div style="height:var(--header-h)"></div>
      <section class="section">
        <p class="section-title">${this.t('site.about_title')}</p>
        <h2 class="section-heading">${this.t('site.about_heading')}</h2>
        <div class="about-grid">
          <div class="about-image">
            <img src="images/cover.jpg" alt="Dollar Nong" onerror="this.style.display='none'">
          </div>
          <div class="about-text">
            <p>${this.t('site.about_text1')}</p>
            <p>${this.t('site.about_text2')}</p>
            <a href="#/contact" class="btn btn-primary" style="margin-top:16px">${this.t('site.cta_contact')}</a>
          </div>
        </div>
      </section>
    `;
  },

  renderContact(main) {
    main.innerHTML = `
      <div style="height:var(--header-h)"></div>
      <section class="section contact-section">
        <p class="section-title">${this.t('site.contact_title')}</p>
        <h2 class="section-heading" style="color:#fff">${this.t('site.contact_heading')}</h2>
        <p class="section-desc">${this.t('site.contact_desc')}</p>
        <div class="contact-grid">
          <div class="contact-item">
            <div class="contact-item-label">${this.t('site.contact_photographer')}</div>
            <div class="contact-item-value">Dollar Nong</div>
          </div>
          <div class="contact-item">
            <div class="contact-item-label">${this.t('site.contact_email')}</div>
            <div class="contact-item-value"><a href="mailto:dollarnong@gmail.com">dollarnong@gmail.com</a></div>
          </div>
          <div class="contact-item">
            <div class="contact-item-label">${this.t('site.contact_wechat')}</div>
            <div class="contact-item-value">dollarnong2017</div>
          </div>
        </div>
      </section>
    `;
  },

  openLightbox(images, index) {
    this.currentImages = images;
    this.currentIndex = index;
    const lb = document.getElementById('lightbox');
    if (!lb) {
      const lbHTML = document.createElement('div');
      lbHTML.id = 'lightbox';
      lbHTML.className = 'lightbox';
      lbHTML.innerHTML = `
        <div class="lightbox-close" id="lbClose">✕</div>
        <div class="lightbox-nav lightbox-prev" id="lbPrev">‹</div>
        <img id="lbImage" src="" alt="">
        <div class="lightbox-nav lightbox-next" id="lbNext">›</div>
        <div class="lightbox-counter" id="lbCounter"></div>
      `;
      document.body.appendChild(lbHTML);
      this.bindLightboxEvents();
    }
    this.updateLightbox();
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  updateLightbox() {
    const img = this.currentImages[this.currentIndex];
    const lbImg = document.getElementById('lbImage');
    const counter = document.getElementById('lbCounter');
    if (lbImg) lbImg.src = img.full;
    if (counter) counter.textContent = `${this.currentIndex + 1} ${this.t('site.lightbox_of')} ${this.currentImages.length}`;
  },

  bindLightboxEvents() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    document.getElementById('lbClose').addEventListener('click', () => {
      lb.classList.remove('active');
      document.body.style.overflow = '';
    });
    document.getElementById('lbPrev').addEventListener('click', () => {
      this.currentIndex = (this.currentIndex - 1 + this.currentImages.length) % this.currentImages.length;
      this.updateLightbox();
    });
    document.getElementById('lbNext').addEventListener('click', () => {
      this.currentIndex = (this.currentIndex + 1) % this.currentImages.length;
      this.updateLightbox();
    });
    lb.addEventListener('click', (e) => {
      if (e.target === lb) {
        lb.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('active')) return;
      if (e.key === 'Escape') { lb.classList.remove('active'); document.body.style.overflow = ''; }
      if (e.key === 'ArrowLeft') { this.currentIndex = (this.currentIndex - 1 + this.currentImages.length) % this.currentImages.length; this.updateLightbox(); }
      if (e.key === 'ArrowRight') { this.currentIndex = (this.currentIndex + 1) % this.currentImages.length; this.updateLightbox(); }
    });
  },

  setupLazyLoading() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    document.querySelectorAll('img[loading="lazy"]').forEach(img => observer.observe(img));
  },

  bindEvents() {
    // Language switch
    document.addEventListener('click', (e) => {
      const langBtn = e.target.closest('#langBtn');
      if (langBtn) {
        this.lang = this.lang === 'en' ? 'zh' : 'en';
        localStorage.setItem('dn-lang', this.lang);
        this.render();
        return;
      }
    });

    // Navigation
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-nav]');
      if (link) {
        const nav = link.dataset.nav;
        const hash = nav === 'home' ? '#/' : `#/${nav}`;
        if (location.hash !== hash) {
          location.hash = hash;
          this.renderPage();
        }
        document.getElementById('mainNav')?.classList.remove('open');
        e.preventDefault();
        return;
      }
    });

    // Hash change
    window.addEventListener('hashchange', () => this.renderPage());

    // Mobile menu
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#mobileMenuBtn');
      if (btn) {
        document.getElementById('mainNav')?.classList.toggle('open');
      }
    });
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => App.init());
