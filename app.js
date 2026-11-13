/**
 * Roast & Ritual - Interactive Application Engine
 * Handles Cart, Order Ahead, Modals, Category Filtering, and Drawer Navigation
 */

// 1. CART STORE
const RoastCart = {
  KEY: 'roast_ritual_cart_v1',

  get() {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  save(items) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(items));
    } catch (e) {}
    this.updateUI();
  },

  add(item) {
    const items = this.get();
    const existing = items.find(i => i.id === item.id);
    if (existing) {
      existing.qty += (item.qty || 1);
    } else {
      items.push({
        id: item.id || 'item_' + Date.now(),
        name: item.name,
        price: parseFloat(item.price) || 0,
        qty: item.qty || 1,
        category: item.category || 'General'
      });
    }
    this.save(items);
    showToast(`Added ${item.name} ($${parseFloat(item.price).toFixed(2)}) to your tray!`);
  },

  updateQty(id, delta) {
    let items = this.get();
    const target = items.find(i => i.id === id);
    if (target) {
      target.qty += delta;
      if (target.qty <= 0) {
        items = items.filter(i => i.id !== id);
      }
      this.save(items);
    }
  },

  clear() {
    this.save([]);
  },

  getSummary() {
    const items = this.get();
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const tax = subtotal * 0.05; // 5% estimated tax
    const total = subtotal + tax;
    return { count, subtotal, tax, total, items };
  },

  updateUI() {
    const { count, subtotal, total, items } = this.getSummary();

    // 1. Floating Bar text & buttons
    const cartCounter = document.getElementById('cart-counter-text');
    if (cartCounter) {
      if (count === 0) {
        cartCounter.textContent = 'No items in tray yet';
      } else {
        cartCounter.textContent = `${count} fresh item${count > 1 ? 's' : ''} • $${subtotal.toFixed(2)}`;
      }
    }

    const orderActionBtn = document.getElementById('order-bar-action');
    if (orderActionBtn) {
      if (count === 0) {
        orderActionBtn.textContent = 'Start Order';
      } else {
        orderActionBtn.textContent = `Review (${count})`;
      }
    }

    // 2. Floating bar visibility on homepage
    const homeFloatingBar = document.getElementById('home-floating-cart-bar');
    if (homeFloatingBar) {
      if (count > 0) {
        homeFloatingBar.classList.remove('hidden');
        homeFloatingBar.classList.add('flex');
        const countBadge = document.getElementById('home-cart-count');
        if (countBadge) countBadge.textContent = `${count} item${count > 1 ? 's' : ''} ($${subtotal.toFixed(2)})`;
      } else {
        homeFloatingBar.classList.add('hidden');
        homeFloatingBar.classList.remove('flex');
      }
    }

    // 3. Header badge
    const headerBadges = document.querySelectorAll('.header-cart-badge');
    headerBadges.forEach(b => {
      b.textContent = count;
      if (count > 0) {
        b.classList.remove('hidden');
      } else {
        b.classList.add('hidden');
      }
    });

    // 4. Render modal items if modal is open
    renderCartModal();
  }
};

// 2. TOAST NOTIFICATION
function showToast(message, icon = 'check_circle') {
  let toastContainer = document.getElementById('toast-notification-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-notification-container';
    toastContainer.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none transition-all duration-300 w-11/12 max-w-sm';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'flex items-center gap-2.5 px-4 py-3 rounded-full bg-primary text-on-primary shadow-xl text-sm font-medium animate-bounce-short pointer-events-auto transition-opacity duration-300';
  toast.innerHTML = `
    <span class="material-symbols-outlined text-[20px] text-on-tertiary-container">${icon}</span>
    <span class="truncate flex-1">${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

// 3. CART & CHECKOUT MODAL DRAWER
function openCartModal() {
  const modal = document.getElementById('cartDrawerModal');
  if (modal) {
    renderCartModal();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartModal() {
  const modal = document.getElementById('cartDrawerModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function renderCartModal() {
  const listContainer = document.getElementById('cartModalItemsList');
  const emptyState = document.getElementById('cartModalEmptyState');
  const footerSummary = document.getElementById('cartModalFooter');
  if (!listContainer || !emptyState || !footerSummary) return;

  const { count, subtotal, tax, total, items } = RoastCart.getSummary();

  if (count === 0) {
    listContainer.innerHTML = '';
    emptyState.classList.remove('hidden');
    footerSummary.classList.add('hidden');
  } else {
    emptyState.classList.add('hidden');
    footerSummary.classList.remove('hidden');

    listContainer.innerHTML = items.map(item => `
      <div class="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60">
        <div class="flex-1 min-w-0">
          <h4 class="font-headline-sm text-[16px] text-on-surface font-semibold truncate">${item.name}</h4>
          <span class="font-label-md text-label-md text-on-tertiary-container font-bold">$${(item.price * item.qty).toFixed(2)}</span>
          <span class="font-body-sm text-[12px] text-outline ml-1">($${item.price.toFixed(2)} each)</span>
        </div>
        <div class="flex items-center gap-2 bg-surface-container rounded-full p-1 shrink-0">
          <button class="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface hover:bg-surface-dim active:scale-90 transition-transform font-bold" onclick="RoastCart.updateQty('${item.id}', -1)">-</button>
          <span class="font-label-md text-label-md min-w-[16px] text-center font-bold">${item.qty}</span>
          <button class="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary hover:bg-on-surface-variant active:scale-90 transition-transform font-bold" onclick="RoastCart.updateQty('${item.id}', 1)">+</button>
        </div>
      </div>
    `).join('');

    document.getElementById('cartSubtotalAmount').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cartTaxAmount').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('cartTotalAmount').textContent = `$${total.toFixed(2)}`;
  }
}

function processCheckout() {
  const { count, total, items } = RoastCart.getSummary();
  if (count === 0) {
    showToast('Your tray is empty! Add drinks or pastries first.', 'info');
    return;
  }

  const orderNum = Math.floor(100 + Math.random() * 900);
  const container = document.getElementById('cartDrawerContent');
  if (container) {
    container.innerHTML = `
      <div class="flex flex-col items-center text-center p-6 gap-4">
        <div class="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center animate-bounce">
          <span class="material-symbols-outlined text-[36px]">local_cafe</span>
        </div>
        <div>
          <span class="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-bold">Order Received</span>
          <h2 class="font-headline-md text-headline-md text-primary mt-1">Ritual #${orderNum} Confirmed!</h2>
          <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Our baristas at 1420 SE Belmont St are heating the hearth and pulling your espresso now.
          </p>
        </div>

        <!-- Live Step Tracker -->
        <div class="w-full bg-surface-container-low rounded-xl p-4 flex flex-col gap-3 my-2 text-left">
          <div class="flex items-center gap-3 text-on-tertiary-container font-semibold">
            <span class="material-symbols-outlined text-[20px]">check_circle</span>
            <span class="text-sm">Order sent to Belmont bar</span>
          </div>
          <div class="flex items-center gap-3 text-primary font-semibold animate-pulse">
            <span class="material-symbols-outlined text-[20px]">autorenew</span>
            <span class="text-sm">Double shot extraction in progress</span>
          </div>
          <div class="flex items-center gap-3 text-outline text-sm">
            <span class="material-symbols-outlined text-[20px]">radio_button_unchecked</span>
            <span>Estimated pickup: In ~6 minutes</span>
          </div>
        </div>

        <div class="w-full border-t border-surface-container-highest pt-3 flex justify-between text-sm font-semibold">
          <span>Total Paid (Pickup):</span>
          <span class="text-primary">$${total.toFixed(2)}</span>
        </div>

        <button onclick="RoastCart.clear(); closeCartModal(); location.reload();" class="w-full py-3.5 rounded-full bg-on-tertiary-container text-on-tertiary font-label-lg text-label-lg uppercase tracking-wider font-bold shadow active:scale-95 transition-transform mt-2">
          Done & Start Fresh
        </button>
      </div>
    `;
  }
}

// 4. SIDE NAVIGATION DRAWER
function openNavDrawer() {
  const drawer = document.getElementById('sideNavDrawer');
  if (drawer) {
    drawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeNavDrawer() {
  const drawer = document.getElementById('sideNavDrawer');
  if (drawer) {
    drawer.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// 5. REWARDS MODAL
function openRewardsModal() {
  const modal = document.getElementById('rewardsClubModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeRewardsModal() {
  const modal = document.getElementById('rewardsClubModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// 6. HOMEPAGE CATEGORY TABS DATA & RENDERER
const HOMEPAGE_MENU_DATA = {
  'hot-coffee': [
    { id: 'hc_1', name: 'Single-Origin Pour Over', price: 5.25, badge: 'Best Seller', desc: 'Rotating washed Ethiopian Yirgacheffe or Geisha lot with crisp bergamot and honey notes.' },
    { id: 'hc_2', name: 'Cortado (1:1)', price: 4.50, badge: 'Barista Pick', desc: 'Velvety steamed whole or house oat milk equal parts with our espresso blend.' },
    { id: 'hc_3', name: 'Hojicha Smoked Maple Latte', price: 6.00, badge: 'Seasonal', desc: 'Slow-roasted Japanese green tea steamed with organic wood-fired Vermont maple syrup.' },
    { id: 'hc_4', name: 'Artisanal Flat White', price: 4.75, badge: 'Classic', desc: 'Double ristretto with glossy microfoam in a 6oz earthenware ceramic cup.' }
  ],
  'cold-drinks': [
    { id: 'cd_1', name: 'Smoked Vanilla Cold Foam Cold Brew', price: 6.25, badge: 'New', desc: '18-hr steeped Ethiopian cold brew crowned with organic smoked vanilla foam.' },
    { id: 'cd_2', name: 'Cardamom Orange Blossom Iced Latte', price: 6.75, badge: 'Popular', desc: 'Double espresso, wild orange blossom water, crushed green cardamom pods over crystal ice.' },
    { id: 'cd_3', name: 'Nitro Cascara Fizz', price: 5.75, badge: 'Craft Soda', desc: 'Coffee cherry tea infused with nitrogen, fresh Meyer lemon peel, and sparkling tonic.' },
    { id: 'cd_4', name: 'Iced Oat Shakerato', price: 5.50, badge: 'Refresher', desc: 'Espresso shaken with ice, dark Muscovado sugar syrup, and creamy organic oat milk.' }
  ],
  'teas': [
    { id: 'tea_1', name: 'Ceremonial Uji Matcha Latte', price: 6.25, badge: 'Stone-Ground', desc: 'First-harvest Kyoto Uji matcha whisked with oat milk and wildflower honey.' },
    { id: 'tea_2', name: 'Golden Turmeric Ginger Elixir', price: 5.75, badge: 'Wellness', desc: 'Pressed fresh ginger, turmeric root, cracked black pepper, and steamed coconut milk.' },
    { id: 'tea_3', name: 'Smoked Lapsang Souchong Tea', price: 4.50, badge: 'Single Leaf', desc: 'Pine-smoked mountain black tea with rich amber depth and campfire notes.' }
  ],
  'bakery': [
    { id: 'bak_1', name: 'Brown Butter Pistachio Brioche Knot', price: 5.50, badge: "Baker's Pick", desc: 'Sicilian pistachio cream, browned cultured butter, freshly ground spices.' },
    { id: 'bak_2', name: 'Cardamom Morning Bun', price: 5.00, badge: 'Best Seller', desc: 'Laminated croissant dough coated with coarse spiced brown sugar and zested citrus glaze.' },
    { id: 'bak_3', name: 'Almond Twice-Baked Croissant', price: 5.75, badge: 'Flaky', desc: 'Hearth baked croissant soaked in vanilla syrup, stuffed with rich almond frangipane.' }
  ],
  'bites': [
    { id: 'bite_1', name: 'Wild Chanterelle Sourdough Toast', price: 11.50, badge: 'Warm Kitchen', desc: 'Seared Pacific Northwest chanterelles, whipped chevre goat cheese, thyme oil on house country sourdough.' },
    { id: 'bite_2', name: 'Smoked Trout Brioche Tartine', price: 12.00, badge: 'House Cured', desc: 'Flaked cold-smoked trout, caperberry cream, shaved radish, and fresh dill on butter brioche.' },
    { id: 'bite_3', name: 'Soft Scramble Breakfast Bun', price: 9.50, badge: 'Breakfast', desc: 'Farm pasture eggs, chives, aged cheddar, and caramelized shallot aioli in warm milk bun.' }
  ]
};

function renderHomepageCategory(catKey) {
  const container = document.getElementById('homeMenuOfferingsList');
  if (!container) return;

  const items = HOMEPAGE_MENU_DATA[catKey] || HOMEPAGE_MENU_DATA['hot-coffee'];

  container.innerHTML = items.map(item => `
    <div class="bg-surface-container-lowest p-space-md rounded-lg flex items-start justify-between gap-space-sm shadow-sm hover:shadow transition-shadow">
      <div class="flex flex-col gap-1 min-w-0 flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <h4 class="font-headline-sm text-headline-sm text-on-surface">${item.name}</h4>
          ${item.badge ? `<span class="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">${item.badge}</span>` : ''}
        </div>
        <p class="font-body-sm text-body-sm text-on-surface-variant">${item.desc}</p>
      </div>
      <div class="flex flex-col items-end gap-2 shrink-0">
        <span class="font-label-lg text-label-lg text-on-surface font-bold">$${item.price.toFixed(2)}</span>
        <button onclick="RoastCart.add({ id: '${item.id}', name: '${item.name.replace(/'/g, "\\'")}', price: ${item.price} })" class="px-3 py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm active:scale-90 transition-transform flex items-center gap-1 shadow-sm hover:bg-on-tertiary-container">
          <span class="material-symbols-outlined text-[15px]">add</span> Add
        </button>
      </div>
    </div>
  `).join('');
}

// 7. INJECT MODAL SKELETONS INTO DOM
function injectModals() {
  // If modals already injected, skip
  if (document.getElementById('cartDrawerModal')) return;

  const modalsHtml = `
    <!-- CART / CHECKOUT DRAWER MODAL -->
    <div id="cartDrawerModal" class="hidden fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div class="relative w-full max-w-md bg-surface h-full flex flex-col shadow-2xl overflow-hidden ml-auto">
        <!-- Header -->
        <div class="h-16 px-5 border-b border-surface-container-high flex items-center justify-between shrink-0 bg-surface/90">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-on-tertiary-container text-[24px]">shopping_bag</span>
            <h3 class="font-headline-sm text-headline-sm text-primary font-bold">Your Ritual Tray</h3>
          </div>
          <button onclick="closeCartModal()" class="w-9 h-9 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors">
            <span class="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <!-- Scrollable Content -->
        <div id="cartDrawerContent" class="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <!-- Empty State -->
          <div id="cartModalEmptyState" class="flex flex-col items-center justify-center text-center py-16 gap-3 text-on-surface-variant">
            <div class="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline">
              <span class="material-symbols-outlined text-[32px]">local_cafe</span>
            </div>
            <h4 class="font-headline-sm text-headline-sm text-on-surface">Your tray is empty</h4>
            <p class="font-body-sm text-body-sm max-w-xs">Explore our roast offerings or baked goods and add your favorites.</p>
            <a href="menu.html" onclick="closeCartModal()" class="mt-2 px-6 py-2.5 rounded-full bg-on-tertiary-container text-on-tertiary font-label-md text-label-md uppercase tracking-wider font-bold">
              Explore Menu
            </a>
          </div>

          <!-- Items List -->
          <div id="cartModalItemsList" class="flex flex-col gap-3"></div>
        </div>

        <!-- Summary & Checkout Footer -->
        <div id="cartModalFooter" class="hidden p-5 border-t border-surface-container-high bg-surface-container-low shrink-0 flex flex-col gap-3">
          <div class="flex flex-col gap-1.5 text-sm text-on-surface-variant">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span id="cartSubtotalAmount" class="font-semibold text-on-surface">$0.00</span>
            </div>
            <div class="flex justify-between">
              <span>Estimated Tax (5%)</span>
              <span id="cartTaxAmount" class="font-semibold text-on-surface">$0.00</span>
            </div>
            <div class="flex justify-between text-base font-bold text-primary pt-1 border-t border-surface-container-highest">
              <span>Total Pickup:</span>
              <span id="cartTotalAmount">$0.00</span>
            </div>
          </div>

          <!-- Pickup Time Estimate -->
          <div class="flex items-center gap-2 p-2.5 rounded-lg bg-surface text-xs text-on-surface-variant">
            <span class="material-symbols-outlined text-[18px] text-on-tertiary-container">schedule</span>
            <span>Estimated ready in <strong>~7 minutes</strong> at 1420 SE Belmont St</span>
          </div>

          <button onclick="processCheckout()" class="w-full py-3.5 rounded-full bg-on-tertiary-container text-on-tertiary font-label-lg text-label-lg uppercase tracking-wider font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
            <span>Confirm Order Ahead</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>

    <!-- SIDE NAVIGATION DRAWER -->
    <div id="sideNavDrawer" class="hidden fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm transition-opacity">
      <div class="relative w-80 max-w-[85vw] bg-surface h-full flex flex-col shadow-2xl p-6 justify-between">
        <div class="flex flex-col gap-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <img alt="Roast & Ritual Logo" class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/ALJJyrDQqddSA89qGa8wOknKLP9H1I6qgzUCJraFqZ2uToE2yo1Q1RO1sYMzL0lcBVNlPrIRYHowrSCQUEwbbsfs5EwLoWJUPgcHRp0134JvaVpOo1JvG62aseVKgwxf0YJptW-wS3vg-BmzYyobwb0M1KEdDZvZJ04h78izdEdCo7NE6orCkzDTac0hQD4PQ_IUAG30k782FBbBeW8E73TgTfTPMgotaYMfkpF1ge7HOqRaGg"/>
              <span class="font-headline-sm text-headline-sm text-primary font-bold">Roast & Ritual</span>
            </div>
            <button onclick="closeNavDrawer()" class="w-9 h-9 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container">
              <span class="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          <nav class="flex flex-col gap-2 pt-2">
            <a href="index.html" onclick="closeNavDrawer()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container font-label-lg text-on-surface transition-colors">
              <span class="material-symbols-outlined text-secondary">home</span>
              <span>Home Sanctuary</span>
            </a>
            <a href="menu.html" onclick="closeNavDrawer()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container font-label-lg text-on-surface transition-colors">
              <span class="material-symbols-outlined text-secondary">restaurant_menu</span>
              <span>Interactive Menu</span>
            </a>
            <a href="index.html#specials" onclick="closeNavDrawer()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container font-label-lg text-on-surface transition-colors">
              <span class="material-symbols-outlined text-secondary">star</span>
              <span>Seasonal Rituals</span>
            </a>
            <a href="index.html#visit-us" onclick="closeNavDrawer()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container font-label-lg text-on-surface transition-colors">
              <span class="material-symbols-outlined text-secondary">location_on</span>
              <span>Hours & Location</span>
            </a>
            <button onclick="closeNavDrawer(); openCartModal();" class="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-container font-label-lg text-on-surface transition-colors w-full text-left">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-secondary">shopping_bag</span>
                <span>Review Tray</span>
              </div>
              <span class="header-cart-badge px-2 py-0.5 rounded-full bg-on-tertiary-container text-on-tertiary font-label-sm text-xs font-bold">0</span>
            </button>
            <button onclick="closeNavDrawer(); openRewardsModal();" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container font-label-lg text-on-surface transition-colors w-full text-left">
              <span class="material-symbols-outlined text-secondary">card_giftcard</span>
              <span>Morning Club Rewards</span>
            </button>
          </nav>
        </div>

        <div class="border-t border-surface-container-high pt-4 flex flex-col gap-2 text-xs text-on-surface-variant">
          <p><strong>Open Today:</strong> 6:30 AM – 6:00 PM</p>
          <p>1420 SE Belmont St, Portland OR</p>
          <a href="tel:+15035550182" class="text-on-tertiary-container font-semibold mt-1 flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">call</span> (503) 555-0182
          </a>
        </div>
      </div>
    </div>

    <!-- REWARDS CLUB MODAL -->
    <div id="rewardsClubModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div class="relative w-full max-w-sm bg-surface rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary text-[26px]">award_star</span>
            <h3 class="font-headline-sm text-headline-sm text-primary font-bold">Morning Club</h3>
          </div>
          <button onclick="closeRewardsModal()" class="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div class="bg-surface-container-low p-4 rounded-xl flex flex-col gap-3 border border-surface-container-high">
          <div class="flex justify-between items-center">
            <span class="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Stamp Card</span>
            <span class="font-label-md text-label-md font-bold text-on-tertiary-container">4 of 5 Punches</span>
          </div>
          <div class="flex justify-between items-center py-1">
            <span class="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">☕</span>
            <span class="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">☕</span>
            <span class="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">☕</span>
            <span class="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">☕</span>
            <span class="w-9 h-9 rounded-full border-2 border-dashed border-outline text-outline flex items-center justify-center font-bold text-sm">🎁</span>
          </div>
          <p class="font-body-sm text-[12px] text-on-surface-variant">1 more handcrafted drink unlocks a complimentary pastry or seasonal pour-over!</p>
        </div>

        <button onclick="showToast('Perk active: 10% applied at bar!', 'verified'); closeRewardsModal();" class="w-full py-3 rounded-full bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider font-bold shadow hover:bg-on-surface-variant transition-colors">
          Redeem at Counter
        </button>
      </div>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = modalsHtml;
  document.body.appendChild(div);
}

// 8. INITIALIZE ENGINE ON DOM READY
document.addEventListener('DOMContentLoaded', () => {
  injectModals();
  RoastCart.updateUI();

  // Attach generic open cart triggers
  document.querySelectorAll('[data-path="order-ahead"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartModal();
    });
  });

  // Attach generic open nav drawer triggers
  document.querySelectorAll('button[aria-label="Open Navigation Menu"]').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      openNavDrawer();
    };
  });

  // Attach profile icon triggers
  document.querySelectorAll('.profile-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      openRewardsModal();
    };
  });

  // Homepage tabs listener
  const homeTabs = document.querySelectorAll('.menu-tab');
  if (homeTabs.length > 0) {
    homeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        homeTabs.forEach(t => {
          t.classList.remove('bg-primary', 'text-on-primary');
          t.classList.add('bg-surface-container', 'text-on-surface-variant');
        });
        tab.classList.remove('bg-surface-container', 'text-on-surface-variant');
        tab.classList.add('bg-primary', 'text-on-primary');

        const cat = tab.getAttribute('data-category');
        renderHomepageCategory(cat);
      });
    });
    // Initial render
    renderHomepageCategory('hot-coffee');
  }
});
