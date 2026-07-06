# Dollar Nong Photography — Free Deployment Guide

## 零成本部署方案（Cloudflare Pages + GitHub）

### 方案一：Cloudflare Pages（推荐，全球 CDN 加速）

#### 1. 注册账号
1. 打开 https://dash.cloudflare.com/ 注册账号
2. 进入 **Workers & Pages** → **Pages**

#### 2. 上传部署
```
方法 A：连接 GitHub 仓库
1. 把源码推送到 GitHub 仓库
2. 在 Cloudflare Pages 点 "Create application" → "Connect to Git"
3. 选择你的仓库，构建命令留空，发布目录选根目录
4. 点 "Save and Deploy"

方法 B：直接上传文件夹
1. 把 dollar-nong-photography 整个文件夹压缩成 zip
2. 在 Cloudflare Pages 点 "Create application" → "Direct Upload"
3. 上传 zip，自动部署
```

#### 3. 免费域名
```
部署完成后 Cloudflare 自动分配：
https://<your-project>.pages.dev

例如：https://dollar-nong.pages.dev
```

#### 4. 图片存储方案

**方案 A：直接用 GitHub 仓库图片（推荐新手）**
1. 把图片上传到 GitHub 仓库的 `images/` 目录
2. 使用 `https://raw.githubusercontent.com/<用户名>/<仓库>/main/images/xxx.jpg`
3. 更新 `data/portfolio.json` 里的图片链接

**方案 B：Cloudflare R2 免费对象存储**
1. 进入 Cloudflare 控制台 → R2 → 创建存储桶
2. 上传图片 → 公开访问 → 获取外链
3. 复制外链地址更新到 `data/portfolio.json`

#### 5. 自定义域名（可选）
```
1. Cloudflare Pages → 你的项目 → Custom domains
2. 输入你的域名（如 photos.dollarnong.com）
3. 按提示添加 DNS 记录
4. 等待 SSL 证书自动颁发（约1-2分钟）
```

---

### 方案二：GitHub Pages

#### 1. 创建仓库
```
仓库名必须为：<用户名>.github.io
例如用户名为 dollarnong，则仓库名为 dollarnong.github.io
```

#### 2. 上传源码
```bash
git clone https://github.com/<用户名>/<用户名>.github.io.git
# 把 dollar-nong-photography 文件夹所有文件复制到仓库根目录
git add .
git commit -m "Initial deploy"
git push
```

#### 3. 访问地址
```
https://<用户名>.github.io
```

#### 4. 启用 HTTPS
```
GitHub Pages 默认开启 HTTPS，无需额外配置
```

---

### 管理员后台配置

#### 默认登录账号
- **用户名**: `admin`
- **密码**: `dollar123`

#### 修改密码
1. 打开 `js/admin.js`
2. 找到 `stored = JSON.parse(localStorage.getItem('dn-admin-creds') || '{"user":"admin","pass":"dollar123"}')`
3. 修改 `pass` 的值即可

#### 首次使用
1. 访问 `https://你的域名/admin/`
2. 用 admin / dollar123 登录
3. 点选分类（Portrait/Event/Food），拖拽上传图片
4. 图片会自动显示在前端画廊

---

### 图片文件夹结构

```
dollar-nong-photography/
├── images/
│   ├── portrait/
│   │   ├── thumbs/     ← 缩略图（建议 400px 宽）
│   │   └── full/       ← 高清原图（建议 1920px 宽）
│   ├── event/
│   │   ├── thumbs/
│   │   └── full/
│   └── food/
│       ├── thumbs/
│       └── full/
├── data/
│   └── portfolio.json  ← 图库数据（手动或后台管理更新）
└── ...
```

---

### 本地预览

```bash
# 方式一：Python
cd dollar-nong-photography
python3 -m http.server 8000
# 访问 http://localhost:8000

# 方式二：Node.js
npx serve dollar-nong-photography
# 访问 http://localhost:3000
```

---

### 常见问题

**Q: 图片加载慢怎么办？**
A: 使用 Cloudflare R2 存储图片，自带 CDN 加速。或者在 portfolio.json 中把 thumb 链接改为更小尺寸的图片。

**Q: 如何修改联系方式？**
A: 编辑 `js/app.js`，在 `renderContact()` 方法中修改 email 和微信 ID。或在后台 Settings 页面修改。

**Q: 后台管理保存的图片在哪？**
A: 由于是静态站点，后台上传的图片保存在浏览器本地（localStorage），刷新后不会丢失，但部署时需要将 `data/portfolio.json` 更新为最新的数据。

**Q: 如何批量导入已有图片？**
A: 将所有图片上传到对应文件夹，然后手动编辑 `data/portfolio.json`，按已有格式添加图片条目即可。

---

### 技术支持

Photographer: **Dollar Nong**
Email: **dollarnong@gmail.com**
WeChat: **dollarnong2017**
