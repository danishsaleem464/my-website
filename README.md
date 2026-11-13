# ☕ Roast & Ritual Coffee Shop Website

Artisanal coffee shop and bakehouse website featuring a modern responsive design, dynamic category filtering, interactive ritual tray (cart), live order status tracker, and an included zero-dependency Node.js localhost web server.

---

## 🚀 How to Run Locally (Localhost Access)

This project includes a built-in local web server. No npm installations or heavy dependencies are required.

### Option 1: Quick Launch (Windows)
Double-click the **`start-server.bat`** file in this directory.

### Option 2: Using Node.js
Open your terminal inside this folder and run:
```bash
node server.js
```
or
```bash
npm start
```

### Option 3: Direct Access
Once started, open your browser and navigate to:
- **Homepage:** `http://localhost:3000`
- **Interactive Menu:** `http://localhost:3000/menu`

---

## 🌟 Features Included

- **🏠 Homepage (`index.html`)**:
  - Hero banner with SE Belmont roastery atmosphere
  - Today's limited seasonal offerings with instant `+ Add` action buttons
  - Interactive tabbed morning offerings switcher (*Hot Coffee, Cold Drinks, Teas, Bakehouse, Light Bites*)
  - Belmont sanctuary community gallery & local testimonials
  - Hours table, map locator, and one-tap call/directions actions
  - The Morning Club newsletter & social links

- **☕ Full Menu (`menu.html`)**:
  - Real-time search bar for drinks, beans, and pastries
  - Sticky category switcher (*Hot Coffee, Cold Brew, Bakehouse, Savory*)
  - One-tap dietary philosophy filters (*Organic Dairy, Gluten-Free, Sugar-Free*)
  - Micro-interactions for adding items to the ritual tray

- **🛍️ Interactive Ritual Tray & Order Ahead**:
  - Live persistent cart across pages (`localStorage`)
  - Floating status pill showing preparation estimate (~7 mins) and live tray count
  - Full slide-over checkout drawer with quantity controls (`+` / `-`), subtotal, and tax
  - Live order confirmation simulation with barista step tracker

- **⚡ Built-in Localhost Web Server (`server.js`)**:
  - Zero external dependencies (uses native Node.js `http`, `fs`, `path`)
  - Clean URL routing (`/` and `/menu`)
  - Automatic MIME type resolution for all assets
