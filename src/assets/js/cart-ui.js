/* ============================================ */
/*                  Cart UI                    */
/* ============================================ */

// UI state
let cartUI = {
  isInitialized: false,
  sidebar: null,
  overlay: null,
  cartIcon: null,
  suppressNextOutsideClose: false
};

// ====== CART UI INITIALIZATION ======

function initCartUI() {
  if (cartUI.isInitialized) return;
  
  createCartSidebar();
  createCartOverlay();
  updateCartIcon();
  setupCartEventListeners();
  
  cartUI.isInitialized = true;
}

function createCartSidebar() {
  // Remove existing sidebar if it exists
  const existingSidebar = document.getElementById('cart-sidebar');
  if (existingSidebar) {
    existingSidebar.remove();
  }

  const sidebar = document.createElement('div');
  sidebar.id = 'cart-sidebar';
  sidebar.className = 'cart-sidebar';
  sidebar.innerHTML = getCartSidebarHTML();
  
  document.body.appendChild(sidebar);
  cartUI.sidebar = sidebar;
}

function createCartOverlay() {
  // Remove existing overlay if it exists
  const existingOverlay = document.getElementById('cart-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  const overlay = document.createElement('div');
  overlay.id = 'cart-overlay';
  overlay.className = 'cart-overlay';
  overlay.innerHTML = getCartOverlayHTML();
  
  document.body.appendChild(overlay);
  cartUI.overlay = overlay;
}

// ====== CART HTML TEMPLATES ======

function getCartSidebarHTML() {
  return `
    <div class="cart-sidebar__header">
      <h3 class="cart-sidebar__title">Your Cart</h3>
      <button class="cart-sidebar__close" onclick="closeCart()" aria-label="Close cart">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="cart-sidebar__content">
      <div class="cart-items" id="cart-items-list">
        <!-- Cart items will be rendered here -->
      </div>
      <div class="cart-empty" id="cart-empty-state" style="display: none;">
        <div class="cart-empty__icon">🛒</div>
        <p class="cart-empty__message">Your cart is empty</p>
        <p class="cart-empty__submessage">Add some items to get started</p>
      </div>
    </div>
    <div class="cart-sidebar__footer">
      <div class="cart-total">
        <div class="cart-total__items">${getItemCount()} items</div>
        <div class="cart-total__amount" id="cart-total-amount">$0.00</div>
      </div>
      <button type="button" class="cart-checkout-btn" id="cart-checkout-btn" onclick="event.preventDefault(); event.stopPropagation(); handleCheckout()">
        Proceed to Checkout
      </button>
    </div>
  `;
}

function getCartOverlayHTML() {
  return `
    <div class="cart-overlay__header">
      <button class="cart-overlay__back" onclick="closeCart()" aria-label="Close cart">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12,19 5,12 12,5"></polyline>
        </svg>
      </button>
      <h3 class="cart-overlay__title">Your Cart</h3>
      <div></div>
    </div>
    <div class="cart-overlay__content">
      <div class="cart-items" id="cart-items-list-mobile">
        <!-- Cart items will be rendered here -->
      </div>
      <div class="cart-empty" id="cart-empty-state-mobile" style="display: none;">
        <div class="cart-empty__icon">🛒</div>
        <p class="cart-empty__message">Your cart is empty</p>
        <p class="cart-empty__submessage">Add some items to get started</p>
      </div>
    </div>
    <div class="cart-overlay__footer">
      <div class="cart-total">
        <div class="cart-total__items">${getItemCount()} items</div>
        <div class="cart-total__amount" id="cart-total-amount-mobile">$0.00</div>
      </div>
      <button type="button" class="cart-checkout-btn" id="cart-checkout-btn-mobile" onclick="event.preventDefault(); event.stopPropagation(); handleCheckout()">
        Proceed to Checkout
      </button>
    </div>
  `;
}

// ====== CART UI FUNCTIONS ======

function openCart() {
  // Ensure cart UI is initialized
  if (!cartUI.isInitialized) {
    initCartUI();
  }
  
  cartState.isOpen = true;
  
  if (window.innerWidth <= 768) {
    // Mobile: Show full-screen overlay
    if (cartUI.overlay) {
      cartUI.overlay.classList.add('cart-overlay--open');
    }
    document.body.classList.add('cart-open');
    document.documentElement.classList.add('cart-open');
  } else {
    // Desktop: Show sidebar
    if (cartUI.sidebar) {
      cartUI.sidebar.classList.add('cart-sidebar--open');
    }
    document.body.classList.add('cart-open');
    document.documentElement.classList.add('cart-open');
  }
  
  renderCartItems();
  updateCartTotals();
}

function closeCart() {
  cartState.isOpen = false;
  
  // Safely remove classes only if elements exist
  if (cartUI.sidebar) {
    cartUI.sidebar.classList.remove('cart-sidebar--open');
  }
  if (cartUI.overlay) {
    cartUI.overlay.classList.remove('cart-overlay--open');
  }
  document.body.classList.remove('cart-open');
  document.documentElement.classList.remove('cart-open');
  // Also clear any inline scroll locks that may have been applied elsewhere
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}

function toggleCart() {
  if (cartState.isOpen) {
    closeCart();
  } else {
    openCart();
  }
}

// ====== CART RENDERING ======

function renderCartItems() {
  const desktopList = document.getElementById('cart-items-list');
  const mobileList = document.getElementById('cart-items-list-mobile');
  const desktopEmpty = document.getElementById('cart-empty-state');
  const mobileEmpty = document.getElementById('cart-empty-state-mobile');
  
  if (isCartEmpty()) {
    // Show empty state
    if (desktopList) desktopList.style.display = 'none';
    if (mobileList) mobileList.style.display = 'none';
    if (desktopEmpty) desktopEmpty.style.display = 'block';
    if (mobileEmpty) mobileEmpty.style.display = 'block';
  } else {
    // Show items
    if (desktopList) desktopList.style.display = 'block';
    if (mobileList) mobileList.style.display = 'block';
    if (desktopEmpty) desktopEmpty.style.display = 'none';
    if (mobileEmpty) mobileEmpty.style.display = 'none';
    
    const itemsHTML = cartState.items.map(item => getCartItemHTML(item)).join('');
    
    if (desktopList) desktopList.innerHTML = itemsHTML;
    if (mobileList) mobileList.innerHTML = itemsHTML;
  }
}

function getCartItemHTML(item) {
  const price = Number(item.basePrice || item.price || 0);
  const quantity = Number(item.quantity || 0);
  const itemSubtotal = price * quantity;
  const formattedPrice = `$${price.toFixed(2)}`;
  const formattedSubtotal = `$${itemSubtotal.toFixed(2)}`;
  
  return `
    <div class="cart-item" data-item-id="${item.id}">
      <div class="cart-item__image">
        <img src="${item.image}" alt="${item.title}" loading="lazy">
      </div>
      <div class="cart-item__details">
        <h4 class="cart-item__title">${item.title}</h4>
        <p class="cart-item__description">${item.description}</p>
        <div class="cart-item__price-info">
          <span class="cart-item__unit-price">${formattedPrice} each</span>
        </div>
        <div class="cart-item__quantity">
          <button class="cart-item__qty-btn" onclick="event.preventDefault(); event.stopPropagation(); updateItemQuantity('${item.id}', ${item.quantity - 1})" aria-label="Decrease quantity">-</button>
          <span class="cart-item__qty-value">${item.quantity}</span>
          <button class="cart-item__qty-btn" onclick="event.preventDefault(); event.stopPropagation(); updateItemQuantity('${item.id}', ${item.quantity + 1})" aria-label="Increase quantity">+</button>
        </div>
        <div class="cart-item__subtotal">
          <span class="cart-item__subtotal-label">Subtotal:</span>
          <span class="cart-item__subtotal-amount">${formattedSubtotal}</span>
        </div>
      </div>
      <button class="cart-item__remove" onclick="event.preventDefault(); event.stopPropagation(); removeFromCart('${item.id}')" aria-label="Remove item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3,6 5,6 21,6"></polyline>
          <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
        </svg>
      </button>
    </div>
  `;
}

function updateCartTotals() {
  const totalAmount = (typeof getCartTotal === 'function' ? getCartTotal() : cart.getCartTotal()).toFixed(2);
  const itemCount = getItemCount();
  
  // Update desktop elements
  const desktopTotal = document.getElementById('cart-total-amount');
  const desktopItems = document.querySelector('.cart-sidebar .cart-total__items');
  
  if (desktopTotal) desktopTotal.textContent = `$${totalAmount}`;
  if (desktopItems) desktopItems.textContent = `${itemCount} items`;
  
  // Update mobile elements
  const mobileTotal = document.getElementById('cart-total-amount-mobile');
  const mobileItems = document.querySelector('.cart-overlay .cart-total__items');
  
  if (mobileTotal) mobileTotal.textContent = `$${totalAmount}`;
  if (mobileItems) mobileItems.textContent = `${itemCount} items`;
  
  // Update cart icon
  updateCartIcon();
}

function updateCartIcon() {
  const cartIcon = document.querySelector('.cart-btn');
  // Use more specific selector to find badge
  const badge = document.querySelector('#navigation .cart-btn .badge') || 
                document.querySelector('.cart-btn .badge') || 
                document.querySelector('.badge');
  
  if (cartIcon) {
    cartIcon.setAttribute('type', 'button');
    
    // Remove existing listeners to prevent duplicates
    cartIcon.removeEventListener('click', handleCartIconClick);
    cartIcon.addEventListener('click', handleCartIconClick, { capture: true });
  }
  
  if (badge) {
    const count = getItemCount();
    const MAX_BADGE_COUNT = 99;
    const display = count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : `${count}`;

    badge.textContent = count > 0 ? display : '';
    // Use flex to match CSS - inline style overrides CSS :empty rule
    badge.style.display = count > 0 ? 'flex' : 'none';
    badge.setAttribute('aria-label', count > 0 ? `${count} items in cart` : 'Cart is empty');
    badge.setAttribute('title', count > 0 ? `${count} items in cart` : 'Cart is empty');
  }
}

function handleCartIconClick(e) {
  e.preventDefault();
  e.stopPropagation();
  if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
  toggleCart();
}

// ====== TOAST NOTIFICATION ======

function showToast(message, type = 'success') {
  // Remove existing toast if any
  const existingToast = document.getElementById('cart-toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.id = 'cart-toast';
  toast.className = `cart-toast cart-toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  
  toast.innerHTML = `
    <div class="cart-toast__content">
      <svg class="cart-toast__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span class="cart-toast__message">${message}</span>
    </div>
  `;

  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('cart-toast--show');
  });

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('cart-toast--show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300); // Wait for fade-out animation
  }, 3000);
}

// ====== EVENT HANDLERS ======

function handleCheckout() {
  // Open inline checkout inside the cart panel
  if (!cartUI.isInitialized) {
    initCartUI();
  }
  
  // Reset form submission flag when opening checkout
  checkoutFormSubmitted = false;
  // Reset Square payment initialization flag so it can be initialized fresh
  squarePaymentInitialized = false;
  
  // Use the appropriate container based on screen size (same logic as openCart)
  let container;
  if (window.innerWidth <= 768) {
    // Mobile: Use overlay
    container = cartUI.overlay;
  } else {
    // Desktop: Use sidebar
    container = cartUI.sidebar;
  }
  
  if (!container) return;

  // Find the scrollable content area to host the checkout panel (keep footer pinned)
  const content = container.querySelector('.cart-sidebar__content') || container.querySelector('.cart-overlay__content');
  if (!content) return;

  // Mark container as being in checkout mode so we can adjust UI (e.g., hide footer)
  container.classList.add('cart-has-checkout');

  // Suppress the outside-click close for this interaction cycle
  cartUI.suppressNextOutsideClose = true;

  content.innerHTML = getCheckoutPanelHTML();
  attachCheckoutEventHandlers();
  updateCheckoutTotals();

  // Smoothly reveal the checkout panel without closing the cart
  const panel = content.querySelector('.checkout-panel');
  if (panel) {
    requestAnimationFrame(() => {
      panel.classList.add('checkout-panel--open');
      const firstField = panel.querySelector('#co-name');
      if (firstField && typeof firstField.focus === 'function') {
        firstField.focus();
      }
    });
  }
}

// ====== EVENT LISTENERS ======

function setupCartEventListeners() {
  // Listen for cart updates
  onCartUpdated(() => {
    renderCartItems();
    updateCartTotals();
    updateCartIcon(); // Ensure cart icon is updated on every cart change
  });
  
  // Listen for item added event to show toast
  cart.addCartEventListener('itemAdded', (data) => {
    const product = data.product;
    const productTitle = product.title || product.name || 'Item';
    showToast(`${productTitle} added to cart!`);
  });
  
  // Listen for window resize to handle mobile/desktop switching
  window.addEventListener('resize', () => {
    if (cartState.isOpen) {
      // Close cart first to ensure clean state
      cartState.isOpen = false;
      if (cartUI.sidebar) {
        cartUI.sidebar.classList.remove('cart-sidebar--open');
      }
      if (cartUI.overlay) {
        cartUI.overlay.classList.remove('cart-overlay--open');
      }
      // Don't remove cart-open class yet, we'll reopen immediately
      
      setTimeout(() => {
        openCart(); // Reopen with correct layout
      }, 100);
    }
  });
  

  // Close cart when clicking outside
  document.addEventListener('click', (e) => {
    if (cartUI.suppressNextOutsideClose) {
      // Allow one click cycle without closing (e.g., after swapping in checkout panel)
      cartUI.suppressNextOutsideClose = false;
      return;
    }
    if (cartState.isOpen && 
        !e.target.closest('.cart-sidebar') && 
        !e.target.closest('.cart-overlay') &&
        !e.target.closest('.cart-btn')) {
      closeCart();
    }
  });
}

// ====== GLOBAL FUNCTIONS ======

// Make functions globally available
window.openCart = openCart;
window.closeCart = closeCart;
window.toggleCart = toggleCart;
window.handleCheckout = handleCheckout;
window.updateItemQuantity = (productId, quantity) => {
  cart.updateItemQuantity(productId, quantity);
  renderCartItems();
  updateCartTotals();
};

window.removeFromCart = (productId) => {
  cart.removeFromCart(productId);
  renderCartItems();
  updateCartTotals();
};

// Initialize cart UI when DOM is ready
function initializeCartOnReady() {
  // Wait a bit for all scripts to load
  if (typeof cart === 'undefined') {
    setTimeout(initializeCartOnReady, 50);
    return;
  }
  
  initCartUI();
  // Ensure cart icon is updated immediately after initialization
  setTimeout(updateCartIcon, 100);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCartOnReady);
} else {
  // If DOM is already loaded, wait for scripts to load
  initializeCartOnReady();
}

// ====== CHECKOUT INLINE PANEL ======

function getCheckoutPanelHTML() {
  const itemCount = getItemCount();
  const subtotal = (typeof getCartTotal === 'function' ? getCartTotal() : cart.getCartTotal()).toFixed(2);
  
  // Build line items HTML
  const lineItemsHTML = cartState.items.map(item => {
    const price = Number(item.basePrice || item.price || 0);
    const quantity = Number(item.quantity || 0);
    const itemSubtotal = price * quantity;
    return `
      <div class="checkout-line-item">
        <div class="checkout-line-item__name">${item.title} × ${quantity}</div>
        <div class="checkout-line-item__price">$${itemSubtotal.toFixed(2)}</div>
      </div>
    `;
  }).join('');
  
  return `
    <div class="checkout-panel">
      <div class="checkout-panel__section">
        <h4 class="checkout-panel__title">Contact & Shipping</h4>
        <div class="checkout-form">
          <div class="checkout-field">
            <input id="co-name" class="checkout-input" type="text" placeholder="Full name" autocomplete="name" required>
            <span class="checkout-error" id="co-name-error"></span>
          </div>
          <div class="checkout-field">
            <input id="co-email" class="checkout-input" type="email" placeholder="Email" autocomplete="email" required>
            <span class="checkout-error" id="co-email-error"></span>
          </div>
          <div class="checkout-field">
            <input id="co-address" class="checkout-input" type="text" placeholder="Address" autocomplete="address-line1" required>
            <span class="checkout-error" id="co-address-error"></span>
          </div>
          <div class="checkout-row">
            <div class="checkout-field">
              <input id="co-city" class="checkout-input" type="text" placeholder="City" autocomplete="address-level2" required>
              <span class="checkout-error" id="co-city-error"></span>
            </div>
            <div class="checkout-field">
              <input id="co-state" class="checkout-input" type="text" placeholder="State" maxlength="2" autocomplete="address-level1" required>
              <span class="checkout-error" id="co-state-error"></span>
            </div>
            <div class="checkout-field">
              <input id="co-zip" class="checkout-input" type="text" placeholder="ZIP" autocomplete="postal-code" required>
              <span class="checkout-error" id="co-zip-error"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="checkout-panel__section">
        <h4 class="checkout-panel__title">Order Summary</h4>
        <div class="checkout-summary">
          <div class="checkout-line-items">
            ${lineItemsHTML}
          </div>
          <div class="checkout-line"><span>Subtotal</span><span id="co-subtotal">$${subtotal}</span></div>
          <div class="checkout-line"><span>Tax</span><span id="co-tax">$0.00</span></div>
          <div class="checkout-total"><span>Total</span><span id="co-total">$${subtotal}</span></div>
        </div>
      </div>

      <div class="checkout-panel__section">
        <h4 class="checkout-panel__title">Payment</h4>
        <div id="card-container"></div>
        <div class="checkout-actions">
          <button id="card-button" class="cart-checkout-btn">Pay Now</button>
          <button id="co-cancel" class="cart-checkout-btn" style="background:#eee;color:#333;">Back</button>
        </div>
        <div id="payment-status" class="checkout-status"></div>
      </div>
    </div>
  `;
}

function attachCheckoutEventHandlers() {
  const inputs = ['co-name','co-email','co-address','co-city','co-state','co-zip']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  
  // Add input filtering and total update listeners (no validation errors shown yet)
  inputs.forEach(el => {
    // Auto-uppercase state field
    if (el.id === 'co-state') {
      el.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
        // Only validate silently (no error display) until form is submitted
        validateField(el.id, checkoutFormSubmitted);
        updateCheckoutTotals();
      });
    } else if (el.id === 'co-zip') {
      // Only allow digits and dash for ZIP code
      el.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^\d-]/g, '');
        // Only validate silently (no error display) until form is submitted
        validateField(el.id, checkoutFormSubmitted);
        updateCheckoutTotals();
      });
    } else {
      el.addEventListener('input', () => {
        // Only validate silently (no error display) until form is submitted
        validateField(el.id, checkoutFormSubmitted);
        updateCheckoutTotals();
      });
    }
    // Validate on blur only if form has been submitted
    el.addEventListener('blur', () => {
      if (checkoutFormSubmitted) {
        validateField(el.id, true);
      }
    });
  });

  const cancelBtn = document.getElementById('co-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      // Reset form submission flag
      checkoutFormSubmitted = false;
      // Reset Square payment initialization flag
      squarePaymentInitialized = false;
      // Recreate containers and reopen cart to restore default view
      createCartSidebar();
      createCartOverlay();
      openCart();
    });
  }
}

// ====== FORM VALIDATION ======

// Track if user has attempted to submit the form
let checkoutFormSubmitted = false;

// Track if Square payment has been initialized to prevent multiple initializations
let squarePaymentInitialized = false;

function validateName(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return { valid: false, message: 'Full name is required' };
  }
  if (trimmed.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return { valid: false, message: 'Name contains invalid characters' };
  }
  return { valid: true, message: '' };
}

function validateEmail(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return { valid: false, message: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  return { valid: true, message: '' };
}

function validateAddress(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return { valid: false, message: 'Address is required' };
  }
  if (trimmed.length < 5) {
    return { valid: false, message: 'Address must be at least 5 characters' };
  }
  return { valid: true, message: '' };
}

function validateCity(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return { valid: false, message: 'City is required' };
  }
  if (trimmed.length < 2) {
    return { valid: false, message: 'City must be at least 2 characters' };
  }
  return { valid: true, message: '' };
}

function validateState(value) {
  const trimmed = (value || '').trim().toUpperCase();
  if (!trimmed) {
    return { valid: false, message: 'State is required' };
  }
  if (trimmed.length !== 2) {
    return { valid: false, message: 'State must be 2 letters (e.g., CA, NY)' };
  }
  if (!/^[A-Z]{2}$/.test(trimmed)) {
    return { valid: false, message: 'State must be 2 letters only' };
  }
  return { valid: true, message: '' };
}

function validateZip(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return { valid: false, message: 'ZIP code is required' };
  }
  const zipRegex = /^\d{5}(-\d{4})?$/;
  if (!zipRegex.test(trimmed)) {
    return { valid: false, message: 'ZIP code must be 5 digits (or 9 with dash)' };
  }
  return { valid: true, message: '' };
}

function validateField(fieldId, showErrors = false) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}-error`);
  
  if (!field || !errorElement) return false;
  
  const value = field.value;
  let validation;
  
  switch(fieldId) {
    case 'co-name':
      validation = validateName(value);
      break;
    case 'co-email':
      validation = validateEmail(value);
      break;
    case 'co-address':
      validation = validateAddress(value);
      break;
    case 'co-city':
      validation = validateCity(value);
      break;
    case 'co-state':
      validation = validateState(value);
      break;
    case 'co-zip':
      validation = validateZip(value);
      break;
    default:
      return true;
  }
  
  // Only show errors if form has been submitted or explicitly requested
  const shouldShowErrors = showErrors || checkoutFormSubmitted;
  
  if (validation.valid) {
    field.classList.remove('checkout-input--error');
    errorElement.textContent = '';
    errorElement.style.display = 'none';
    return true;
  } else {
    if (shouldShowErrors) {
      field.classList.add('checkout-input--error');
      errorElement.textContent = validation.message;
      errorElement.style.display = 'block';
    }
    return false;
  }
}

function validateCheckoutForm() {
  const fields = ['co-name', 'co-email', 'co-address', 'co-city', 'co-state', 'co-zip'];
  let isValid = true;
  
  // Mark form as submitted so errors will be shown
  checkoutFormSubmitted = true;
  
  fields.forEach(fieldId => {
    if (!validateField(fieldId, true)) {
      isValid = false;
    }
  });
  
  return isValid;
}

function showFirstError() {
  const fields = ['co-name', 'co-email', 'co-address', 'co-city', 'co-state', 'co-zip'];
  for (const fieldId of fields) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (field && errorElement && errorElement.style.display === 'block') {
      // Scroll field into view
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field.focus();
      break;
    }
  }
}

function parseState(value) {
  return (value || '').trim().toUpperCase();
}

function estimateTax(subtotal, state) {
  const defaultRate = 0.07; // 7% default
  const rates = {
    CA: 0.0825,
    NY: 0.08875,
    TX: 0.0825,
    WA: 0.095,
    FL: 0.07,
    IL: 0.1025
  };
  const rate = rates[state] != null ? rates[state] : defaultRate;
  return Math.max(0, subtotal * rate);
}

function getCheckoutAmounts() {
  const subtotal = typeof getCartTotal === 'function' ? getCartTotal() : cart.getCartTotal();
  const state = parseState(document.getElementById('co-state')?.value);
  const tax = estimateTax(subtotal, state);
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

function updateCheckoutTotals() {
  const { subtotal, tax, total } = getCheckoutAmounts();
  const subEl = document.getElementById('co-subtotal');
  const taxEl = document.getElementById('co-tax');
  const totalEl = document.getElementById('co-total');
  if (subEl) subEl.textContent = `$${subtotal.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

  // Update pay button label and disabled state
  const payBtn = document.getElementById('card-button');
  if (payBtn) {
    const labelAmount = `$${total.toFixed(2)}`;
    payBtn.textContent = total > 0 ? `Pay ${labelAmount}` : 'Pay Now';
    // Only disable if total is 0 (don't validate form here to avoid showing errors prematurely)
    payBtn.disabled = !(total > 0);
  }

  // Initialize Square payment binding only once
  if (window.initSquareInlinePayment && !squarePaymentInitialized) {
    const amountCents = Math.round(total * 100);
    
    // Validate form before allowing payment
    const validateBeforePayment = () => {
      if (!validateCheckoutForm()) {
        showFirstError();
        return false;
      }
      return true;
    };
    
    window.initSquareInlinePayment({
      amountCents,
      cardContainerSelector: '#card-container',
      payButtonSelector: '#card-button',
      statusSelector: '#payment-status',
      endpoint: '/api/process-payment.php',
      beforeTokenize: validateBeforePayment,
          onSuccess: (data) => {
        if (typeof cart?.clearCart === 'function') cart.clearCart();
        closeCart();
        if (typeof window.openModal === 'function') {
          const paymentId = data?.payment?.id || '';
          window.openModal({
            type: 'success',
            title: 'Payment Successful',
            message: 'Thank you for your order. Your payment has been processed.',
            details: paymentId ? `Transaction ID: ${paymentId}` : '',
            actions: [
              { label: 'Continue Shopping', variant: 'primary', onClick: () => { window.closeModal(); } }
            ]
          });
        }
      },
      onError: (err) => {
        console.error('Payment error', err);
        if (typeof window.openModal === 'function') {
          let details = '';
          try { details = typeof err === 'string' ? err : JSON.stringify(err); } catch (e) {}
          window.openModal({
            type: 'error',
            title: 'Payment Failed',
            message: 'We could not process your payment. Please try again.',
            details,
            actions: [
              { label: 'Retry', variant: 'primary', onClick: () => { window.closeModal(); /* user can try again */ } },
              { label: 'Close', variant: 'secondary', onClick: () => window.closeModal() }
            ]
          });
        }
      }
    });
    
    squarePaymentInitialized = true;
  }
}

