/* ============================================ */
/*                  Custom Cart                 */
/* ============================================ */

// Global cart state
let cartState = {
  items: [],
  itemCount: 0,
  isOpen: false,
  lastUpdated: new Date().toISOString()
};

// Configuration
const CART_CONFIG = {
  storageKey: 'alaskans_art_cart'
};

// Event listeners storage
const cartListeners = {};

// ====== CART STATE MANAGEMENT ======

function loadCartFromStorage() {
  try {
    const stored = localStorage.getItem(CART_CONFIG.storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      cartState = {
        ...cartState,
        ...parsed,
        isOpen: false // Always start with cart closed
      };
      // Ensure derived totals are consistent with stored items
      updateCartTotals();
    }
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    cartState = getEmptyCartState();
  }
  return cartState;
}

function saveCartToStorage() {
  try {
    cartState.lastUpdated = new Date().toISOString();
    localStorage.setItem(CART_CONFIG.storageKey, JSON.stringify(cartState));
    triggerCartEvent('cartUpdated', cartState);
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
}

function getEmptyCartState() {
  return {
    items: [],
    itemCount: 0,
    isOpen: false,
    lastUpdated: new Date().toISOString()
  };
}

function updateCartTotals() {
  cartState.itemCount = cartState.items.reduce((total, item) => total + item.quantity, 0);
  return cartState.itemCount;
}

// ====== CART OPERATIONS ======

function addToCart(product) {
  if (!product || !product.id) {
    console.error('Invalid product:', product);
    return false;
  }

  const existingItem = cartState.items.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartState.items.push({
      id: product.id,
      title: product.title || product.name || 'Untitled Product',
      image: product.image || '/images/placeholder.jpg',
      description: product.description || '',
      basePrice: product.price || 0,
      quantity: 1
    });
  }

  updateCartTotals();
  saveCartToStorage();
  triggerCartEvent('itemAdded', { product, cart: cartState });
  return true;
}

function removeFromCart(productId) {
  const initialLength = cartState.items.length;
  cartState.items = cartState.items.filter(item => item.id !== productId);
  
  if (cartState.items.length !== initialLength) {
    updateCartTotals();
    saveCartToStorage();
    triggerCartEvent('itemRemoved', { productId, cart: cartState });
    return true;
  }
  return false;
}

function updateItemQuantity(productId, quantity) {
  const item = cartState.items.find(item => item.id === productId);
  
  if (!item) return false;
  
  if (quantity <= 0) {
    return removeFromCart(productId);
  }
  
  item.quantity = Math.max(1, Math.floor(quantity));
  updateCartTotals();
  saveCartToStorage();
  triggerCartEvent('quantityUpdated', { productId, quantity: item.quantity, cart: cartState });
  return true;
}

function clearCart() {
  cartState = getEmptyCartState();
  saveCartToStorage();
  triggerCartEvent('cartCleared', cartState);
  return true;
}

// ====== VALIDATION ======

function validateCart() {
  const isEmpty = cartState.items.length === 0;
  
  return {
    isValid: !isEmpty,
    errors: isEmpty ? ['Cart is empty'] : [],
    isEmpty: isEmpty
  };
}

// ====== GETTERS ======

function getCart() {
  return { ...cartState };
}

function getItemCount() {
  return cartState.itemCount;
}

function getCartTotal() {
  return cartState.items.reduce((sum, item) => {
    const price = Number(item.basePrice || item.price || 0);
    const quantity = Number(item.quantity || 0);
    return sum + (price * quantity);
  }, 0);
}

function isCartEmpty() {
  return cartState.items.length === 0;
}

function getCartSummary() {
  return {
    itemCount: cartState.itemCount,
    total: getCartTotal(),
    items: cartState.items.map(item => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      price: item.basePrice || item.price || 0,
      image: item.image
    }))
  };
}

// ====== CHECKOUT ======

function prepareCheckout() {
  const validation = validateCart();
  
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errors.join(', '),
      cart: cartState
    };
  }

  const subtotal = getCartTotal();

  return {
    success: true,
    cart: cartState,
    subtotal: subtotal,
    items: cartState.items.map(item => ({
      name: item.title,
      quantity: item.quantity,
      price: Number(item.basePrice || item.price || 0),
      subtotal: Number(item.basePrice || item.price || 0) * Number(item.quantity || 0)
    }))
  };
}

// ====== EVENT SYSTEM ======

function onCartUpdated(callback) {
  addCartEventListener('cartUpdated', callback);
}

function addCartEventListener(event, callback) {
  if (!cartListeners[event]) {
    cartListeners[event] = [];
  }
  cartListeners[event].push(callback);
}

function removeCartEventListener(event, callback) {
  if (cartListeners[event]) {
    cartListeners[event] = cartListeners[event].filter(cb => cb !== callback);
  }
}

function triggerCartEvent(event, data) {
  if (cartListeners[event]) {
    cartListeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in cart event listener for ${event}:`, error);
      }
    });
  }
}

// ====== INITIALIZATION ======

function initCart() {
  loadCartFromStorage();
  // Recalculate totals on startup and notify listeners so UI (badge) syncs
  updateCartTotals();
  triggerCartEvent('cartUpdated', cartState);
  triggerCartEvent('cartLoaded', cartState);
}

// Initialize cart when script loads
initCart();

// Make functions globally available
window.cart = {
  addToCart,
  removeFromCart,
  updateItemQuantity,
  clearCart,
  getCart,
  getItemCount,
  getCartTotal,
  isCartEmpty,
  getCartSummary,
  validateCart,
  prepareCheckout,
  onCartUpdated,
  addCartEventListener,
  removeCartEventListener
};

// Also expose addToCart globally for backwards compatibility
window.addToCart = addToCart;
