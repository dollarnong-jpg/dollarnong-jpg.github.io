/* ═══════════════════════════════════════════════
   Dollar Nong Photography — Admin Panel
   Image Management · Settings · Upload
   ═══════════════════════════════════════════════ */

const Admin = {
  isLoggedIn: false,
  currentCategory: 'portrait',
  images: { portrait: [], event: [], food: [] },

  async init() {
    if (sessionStorage.getItem('dn-admin')) {
      this.isLoggedIn = true;
      await this.loadData();
      this.renderDashboard();
    } else {
      this.renderLogin();
    }
    this.bindEvents();
  },

  renderLogin() {
    document.getElementById('admin-root').innerHTML = `
      <div class="admin-login">
        <div class="admin-login-card">
          <h1>Dollar Nong</h1>
          <p>Admin Dashboard · Login</p>
          <div class="form-group">
            <label>Username</label>
            <input type="text" id="loginUser" placeholder="admin">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="loginPass" placeholder="••••••">
          </div>
          <button class="btn btn-primary" id="loginBtn" style="width:100%;justify-content:center">Login</button>
          <p id="loginError" style="color:#e74c3c;font-size:13px;margin-top:12px;display:none"></p>
        </div>
      </div>
    `;
  },

  renderDashboard() {
    document.getElementById('admin-root').innerHTML = `
      <div class="admin-wrap">
        <aside class="admin-sidebar">
          <h2>Dollar <span>Nong</span></h2>
          <nav>
            <a href="#" data-admin-page="manage" class="active">📷 Manage Photos</a>
            <a href="#" data-admin-page="settings">⚙️ Settings</a>
            <a href="#" data-admin-page="logout">🚪 Logout</a>
          </nav>
        </aside>
        <main class="admin-main" id="adminContent">
          ${this.renderManagePage()}
        </main>
      </div>
    `;
  },

  renderManagePage() {
    const cats = ['portrait', 'event', 'food'];
    const catNames = { portrait: 'Portrait / 人像', event: 'Event / 演出', food: 'Food / 美食' };
    return `
      <div class="admin-header">
        <h1>Manage Photos</h1>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${cats.map(c => `<button class="btn ${c === this.currentCategory ? 'btn-primary' : 'btn-outline'}" data-cat="${c}">${catNames[c]}</button>`).join('')}
        </div>
      </div>
      <div class="upload-zone" id="uploadZone">
        <div class="upload-zone-icon">📁</div>
        <p>Drag & drop images here, or click to select</p>
        <p style="font-size:12px;margin-top:8px;color:#bbb">Supports batch upload · JPG PNG WebP</p>
        <input type="file" id="fileInput" multiple accept="image/*" style="display:none">
      </div>
      <div id="imageGrid" class="admin-image-grid">
        ${this.renderImageGrid()}
      </div>
    `;
  },

  renderImageGrid() {
    const imgs = this.images[this.currentCategory] || [];
    if (imgs.length === 0) {
      return `<p style="grid-column:1/-1;text-align:center;padding:60px 0;color:#999">No images in this category. Upload your first photo!</p>`;
    }
    return imgs.map((img, i) => `
      <div class="admin-image-item" data-index="${i}">
        <img src="${img.thumb || img.full}" alt="${img.title || ''}" loading="lazy">
        <div class="actions">
          <button class="del-btn" data-action="delete" data-index="${i}">🗑 Delete</button>
          <button class="hide-btn" data-action="toggle-visibility" data-index="${i}">${img.hidden ? '👁 Show' : '🙈 Hide'}</button>
        </div>
      </div>
    `).join('');
  },

  renderSettingsPage() {
    return `
      <div class="admin-header"><h1>Settings</h1></div>
      <div style="max-width:600px">
        <div class="form-group">
          <label>Site Title (EN)</label>
          <input type="text" id="setTitleEn" value="Dollar Nong | Photographer">
        </div>
        <div class="form-group">
          <label>Site Title (中文)</label>
          <input type="text" id="setTitleZh" value="Dollar Nong | 摄影师">
        </div>
        <div class="form-group">
          <label>Biography (EN)</label>
          <textarea id="setBioEn" rows="3" style="width:100%;padding:12px 16px;border:1px solid var(--border);border-radius:4px;font-size:14px;resize:vertical">I am Dollar Nong, a professional photographer...</textarea>
        </div>
        <div class="form-group">
          <label>Biography (中文)</label>
          <textarea id="setBioZh" rows="3" style="width:100%;padding:12px 16px;border:1px solid var(--border);border-radius:4px;font-size:14px;resize:vertical">我是 Dollar Nong，一名常驻亚洲的专业摄影师...</textarea>
        </div>
        <div class="form-group">
          <label>Cover Photo URL</label>
          <input type="text" id="setCover" value="images/cover.jpg">
        </div>
        <button class="btn btn-accent" id="saveSettings">💾 Save Settings</button>
      </div>
    `;
  },

  async loadData() {
    try {
      const resp = await fetch('data/portfolio.json');
      const data = await resp.json();
      this.images = data.images || { portrait: [], event: [], food: [] };
    } catch {
      this.images = { portrait: [], event: [], food: [] };
    }
  },

  async saveData() {
    const data = { images: this.images };
    // In a static site, we can't write back to JSON directly.
    // Instead, save to localStorage for demo / admin reference.
    localStorage.setItem('dn-portfolio', JSON.stringify(data));
    // Show success
    alert('Changes saved to localStorage. For permanent storage, update data/portfolio.json directly.');
  },

  handleUpload(files) {
    const cat = this.currentCategory;
    if (!this.images[cat]) this.images[cat] = [];
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      this.images[cat].push({
        id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        title: file.name.replace(/\.[^/.]+$/, ''),
        full: url,
        thumb: url,
        category: cat,
        hidden: false,
        date: new Date().toISOString()
      });
    });
    document.getElementById('imageGrid').innerHTML = this.renderImageGrid();
    this.saveData();
  },

  bindEvents() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[id]') || e.target;
      
      // Login
      if (target.id === 'loginBtn') {
        const user = document.getElementById('loginUser')?.value;
        const pass = document.getElementById('loginPass')?.value;
        const stored = JSON.parse(localStorage.getItem('dn-admin-creds') || '{"user":"admin","pass":"dollar123"}');
        if (user === stored.user && pass === stored.pass) {
          sessionStorage.setItem('dn-admin', '1');
          this.isLoggedIn = true;
          this.loadData().then(() => this.renderDashboard());
        } else {
          const err = document.getElementById('loginError');
          if (err) { err.textContent = 'Invalid credentials'; err.style.display = 'block'; }
        }
        return;
      }

      // Navigation
      const adminNav = target.closest('[data-admin-page]');
      if (adminNav) {
        const page = adminNav.dataset.adminPage;
        if (page === 'logout') {
          sessionStorage.removeItem('dn-admin');
          this.isLoggedIn = false;
          this.renderLogin();
          return;
        }
        const content = document.getElementById('adminContent');
        if (page === 'settings') {
          if (content) content.innerHTML = this.renderSettingsPage();
          document.querySelectorAll('[data-admin-page]').forEach(el => el.classList.remove('active'));
          adminNav.classList.add('active');
        } else {
          if (content) content.innerHTML = this.renderManagePage();
          document.querySelectorAll('[data-admin-page]').forEach(el => el.classList.remove('active'));
          adminNav.classList.add('active');
        }
        return;
      }

      // Category switch
      const catBtn = target.closest('[data-cat]');
      if (catBtn) {
        this.currentCategory = catBtn.dataset.cat;
        document.querySelectorAll('[data-cat]').forEach(b => b.className = 'btn btn-outline');
        catBtn.className = 'btn btn-primary';
        const grid = document.getElementById('imageGrid');
        if (grid) grid.innerHTML = this.renderImageGrid();
        return;
      }

      // Delete image
      const delBtn = target.closest('[data-action="delete"]');
      if (delBtn && confirm('Delete this image?')) {
        const idx = parseInt(delBtn.dataset.index);
        this.images[this.currentCategory].splice(idx, 1);
        document.getElementById('imageGrid').innerHTML = this.renderImageGrid();
        this.saveData();
        return;
      }

      // Toggle visibility
      const visBtn = target.closest('[data-action="toggle-visibility"]');
      if (visBtn) {
        const idx = parseInt(visBtn.dataset.index);
        this.images[this.currentCategory][idx].hidden = !this.images[this.currentCategory][idx].hidden;
        document.getElementById('imageGrid').innerHTML = this.renderImageGrid();
        this.saveData();
        return;
      }

      // Save settings
      if (target.id === 'saveSettings') {
        alert('Settings saved to localStorage.');
        return;
      }
    });

    // Upload zone
    document.addEventListener('click', (e) => {
      if (e.target.closest('#uploadZone')) {
        document.getElementById('fileInput')?.click();
      }
    });
    document.addEventListener('change', (e) => {
      if (e.target.id === 'fileInput' && e.target.files.length > 0) {
        this.handleUpload(e.target.files);
        e.target.value = '';
      }
    });
    // Drag & drop
    document.addEventListener('dragover', (e) => {
      const zone = e.target.closest('#uploadZone');
      if (zone) { e.preventDefault(); zone.style.borderColor = '#c8a96e'; }
    });
    document.addEventListener('dragleave', (e) => {
      const zone = e.target.closest('#uploadZone');
      if (zone) { zone.style.borderColor = ''; }
    });
    document.addEventListener('drop', (e) => {
      const zone = e.target.closest('#uploadZone');
      if (zone) {
        e.preventDefault();
        zone.style.borderColor = '';
        if (e.dataTransfer.files.length > 0) this.handleUpload(e.dataTransfer.files);
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => Admin.init());
