document.addEventListener('DOMContentLoaded', () => {

    // --- Product Data ---
    let products = [
        {
            id: 1,
            name: "Royal Rose Bouquet",
            price: 250.00,
            image: "https://images.squarespace-cdn.com/content/v1/624b503a3a6154640a151782/1649102925238-QNHQ6YQJCBM14R6D5KXB/Florist0173.jpg?format=1500w",
            variants: ["Crimson Red", "Deep Pink", "White Roses"],
            category: "best-seller"
        },
        {
            id: 2,
            name: "Hand-Tied Wildflower Bunch",
            price: 75.00,
            image: "https://highlandmoss.com/wp-content/uploads/2025/02/rustic-dried-bouquet.jpg",
            variants: ["Spring Mix", "Pastel Shades"],
            category: "best-seller"
        },
        {
            id: 3,
            name: "Golden Sunflower Bouquet",
            price: 120.00,
            image: "https://heartthorn.com/cdn/shop/products/EternalSunshineSunflowerBouquet2.jpg?v=1631295500",
            variants: [],
            category: "best-seller"
        },
        {
            id: 4,
            name: "Silk Orchid Arrangement",
            price: 95.00,
            image: "https://images.squarespace-cdn.com/content/v1/624b503a3a6154640a151782/1649102925253-KFJ38D7HG4B29XFG0WFC/Florist0213%281%29.jpg?format=1500w",
            variants: ["Ivory White", "Royal Purple"],
            category: "all"
        },
        {
            id: 5,
            name: "Silver Lily Bouquet",
            price: 150.00,
            image: "https://thebridesbouquet.co.uk/wp-content/uploads/2022/01/artificial-silver-grey-bridesmaid-boquuet-with-lily-of-the-valley-and-calla-lilies.jpg",
            variants: [],
            category: "all"
        }
    ];

    // --- DOM Elements ---
    const bestSellerContainer = document.getElementById('best-seller-container');
    const productContainer = document.getElementById('product-container');
    const cartIcon = document.getElementById('cart-icon');
    const cartCount = document.getElementById('cart-count');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');
    const addToCartModal = document.getElementById('add-to-cart-modal');
    const modalProductDetails = document.getElementById('modal-product-details');
    const modalQuantityInput = document.getElementById('modal-quantity');
    const decrementQuantityBtn = document.getElementById('decrement-quantity');
    const incrementQuantityBtn = document.getElementById('increment-quantity');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart-btn');
    const closeBtns = document.querySelectorAll('.close-btn');

    const adminLoginLink = document.getElementById('admin-login-link');
    const adminPanel = document.getElementById('admin-panel');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminLoginView = document.getElementById('admin-login');
    const adminCRUDView = document.getElementById('admin-content');
    const productListAdmin = document.getElementById('product-list-admin');
    const addProductForm = document.getElementById('add-product-form');

    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    let productIdToDelete = null;

    const orderConfirmModal = document.getElementById('order-confirm-modal');
    const okButton = document.getElementById('ok-btn');
    
    // New DOM element for the download button
    const downloadProductsBtn = document.getElementById('download-products-btn');

    // --- Cart & Products Storage ---
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let currentModalProduct = null;
    let productToEditId = null;

    // --- Utility Functions ---
    function saveProductsToLocalStorage() {
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    function saveCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function getProductsFromLocalStorage() {
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
            products = JSON.parse(storedProducts);
        }
    }
    
    function displayMessage(message, duration = 2000) {
        const messageBox = document.createElement('div');
        messageBox.classList.add('temp-message');
        messageBox.textContent = message;
        document.body.appendChild(messageBox);

        setTimeout(() => {
            messageBox.remove();
        }, duration);
    }
    
    function downloadJsonFile() {
        const dataStr = JSON.stringify(products, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'products.json';
        
        let linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        displayMessage("Product data downloaded successfully!");
    }

    // --- Rendering Functions ---
    function renderProducts(productArray, container) {
        container.innerHTML = '';
        productArray.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.id = product.id;
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>$${product.price.toFixed(2)}</p>
                </div>
            `;
            container.appendChild(productCard);
        });
    }

    function renderAllProductViews() {
        const bestSellers = products.filter(p => p.category === "best-seller").slice(0, 3);
        const allProducts = products.filter(p => p.category === "all");
        
        renderProducts(bestSellers, bestSellerContainer);
        renderProducts(allProducts, productContainer);
        renderAdminProducts();
    }

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            cartTotalElement.textContent = '0.00';
            return;
        }

        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" width="50">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.variant ? `Variant: ${item.variant}` : ''}</p>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Price: $${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button class="remove-from-cart-btn" data-id="${item.id}">Remove</button>
            `;
            cartItemsContainer.appendChild(cartItem);
            total += item.price * item.quantity;
        });

        cartTotalElement.textContent = total.toFixed(2);
    }

    function renderAdminProducts() {
        productListAdmin.innerHTML = '';
        products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.className = 'admin-product-item';
            productItem.dataset.id = product.id;
            productItem.innerHTML = `
                <span>${product.name} - $${product.price}</span>
                <div>
                    <button class="edit-product-btn" data-id="${product.id}">Edit</button>
                    <button class="delete-product-btn" data-id="${product.id}">Delete</button>
                </div>
            `;
            productListAdmin.appendChild(productItem);
        });
    }

    // --- Cart Functions ---
    function addToCart(product, quantity, variant) {
        const existingItem = cart.find(item => item.id === product.id && item.variant === variant);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                variant: variant,
                quantity: quantity
            });
        }
        saveCartToLocalStorage();
        renderCart();
        displayMessage("Item added successfully!");
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id != productId);
        saveCartToLocalStorage();
        renderCart();
    }

    // --- Admin CRUD Functions ---
    function addProduct(name, price, image, variants) {
        const newProduct = {
            id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
            name,
            price,
            image,
            variants: variants.split(',').map(v => v.trim()).filter(v => v),
            category: 'all'
        };
        products.push(newProduct);
        saveProductsToLocalStorage();
        renderAllProductViews();
        displayMessage("Product added successfully!");
    }

    function editProduct(id, newName, newPrice, newImage, newVariants) {
        const productIndex = products.findIndex(p => p.id == id);
        if (productIndex > -1) {
            products[productIndex].name = newName;
            products[productIndex].price = newPrice;
            products[productIndex].image = newImage;
            products[productIndex].variants = newVariants.split(',').map(v => v.trim()).filter(v => v);
            saveProductsToLocalStorage();
            renderAllProductViews();
            displayMessage("Product edited successfully!");
        }
    }

    function deleteProduct(id) {
        products = products.filter(p => p.id != id);
        saveProductsToLocalStorage();
        renderAllProductViews();
        displayMessage("Product deleted successfully!");
    }

    // --- Modal Logic ---
    function openAddToCartModal(productId) {
        const product = products.find(p => p.id == productId);
        if (!product) return;
        currentModalProduct = product;

        modalProductDetails.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Price: $${product.price.toFixed(2)}</p>
            ${product.variants && product.variants.length > 0 ? `
            <div class="variants">
                <label for="variant-select">Select Variant:</label>
                <select id="variant-select">
                    ${product.variants.map(variant => `<option value="${variant}">${variant}</option>`).join('')}
                </select>
            </div>` : ''}
        `;
        modalQuantityInput.value = 1;
        addToCartModal.style.display = 'block';
    }

    function closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.style.display = 'none');
    }

    // --- Event Listeners ---
    document.body.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');
        if (productCard) {
            openAddToCartModal(productCard.dataset.id);
        }
    });

    cartIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        cartOverlay.style.display = 'block';
        setTimeout(() => cartSidebar.classList.add('active'), 10);
    });

    document.body.addEventListener('click', (e) => {
        if (cartOverlay.style.display === 'block' && !cartSidebar.contains(e.target) && e.target !== cartIcon && !cartIcon.contains(e.target)) {
            cartSidebar.classList.remove('active');
            setTimeout(() => cartOverlay.style.display = 'none', 300);
        }
    });

    closeCartBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        setTimeout(() => cartOverlay.style.display = 'none', 300);
    });
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modalToClose = e.target.closest('.modal');
            if (modalToClose) {
                modalToClose.style.display = 'none';
            }
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    decrementQuantityBtn.addEventListener('click', () => {
        let quantity = parseInt(modalQuantityInput.value, 10);
        if (quantity > 1) {
            modalQuantityInput.value = quantity - 1;
        }
    });

    incrementQuantityBtn.addEventListener('click', () => {
        let quantity = parseInt(modalQuantityInput.value, 10);
        modalQuantityInput.value = quantity + 1;
    });

    modalAddToCartBtn.addEventListener('click', () => {
        const quantity = parseInt(modalQuantityInput.value, 10);
        const variantSelect = document.getElementById('variant-select');
        const variant = variantSelect ? variantSelect.value : null;
        if (currentModalProduct) {
            addToCart(currentModalProduct, quantity, variant);
            closeAllModals();
            cartOverlay.style.display = 'block';
            setTimeout(() => cartSidebar.classList.add('active'), 10);
        }
    });

    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-from-cart-btn')) {
            const productId = e.target.dataset.id;
            removeFromCart(productId);
        }
    });

    checkoutButton.addEventListener('click', () => {
        localStorage.removeItem('cart');
        cart = [];
        renderCart();
        cartSidebar.classList.remove('active');
        setTimeout(() => cartOverlay.style.display = 'none', 300);
        orderConfirmModal.style.display = 'block';
    });

    okButton.addEventListener('click', () => {
        orderConfirmModal.style.display = 'none';
    });

    adminLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        adminPanel.style.display = 'block';
        adminLoginView.style.display = 'block';
        adminCRUDView.style.display = 'none';
    });

    // Modified login form logic
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;

        if (username === 'Admin' && password === '1234') {
            closeAllModals();
            adminCRUDView.style.display = 'block';
            adminPanel.style.display = 'block';
            adminLoginView.style.display = 'none';
            renderAdminProducts();
            // Show the download button on successful login
            downloadProductsBtn.style.display = 'block'; 
        } else {
            alert('Invalid credentials.');
        }
    });
    
    const adminCRUDCloseBtn = document.querySelector('#admin-content .close-btn');
    if (adminCRUDCloseBtn) {
        adminCRUDCloseBtn.addEventListener('click', () => {
            adminCRUDView.style.display = 'none';
            adminPanel.style.display = 'none';
            // Hide the download button when closing the admin panel
            downloadProductsBtn.style.display = 'none';
        });
    }

    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('product-name-input').value;
        const price = parseFloat(document.getElementById('product-price-input').value);
        const image = document.getElementById('product-image-input').value;
        const variants = document.getElementById('product-variants-input').value;

        if (productToEditId !== null) {
            editProduct(productToEditId, name, price, image, variants);
            e.target.querySelector('button[type="submit"]').textContent = 'Update Product';
            productToEditId = null;
        } else {
            addProduct(name, price, image, variants);
        }
        addProductForm.reset();
    });

    productListAdmin.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-product-btn')) {
            productIdToDelete = e.target.dataset.id;
            deleteConfirmModal.style.display = 'block';
        }
        if (e.target.classList.contains('edit-product-btn')) {
            const productId = e.target.dataset.id;
            const product = products.find(p => p.id == productId);
            if (product) {
                document.getElementById('product-name-input').value = product.name;
                document.getElementById('product-price-input').value = product.price;
                document.getElementById('product-image-input').value = product.image;
                document.getElementById('product-variants-input').value = product.variants.join(', ');
                addProductForm.querySelector('button[type="submit"]').textContent = 'Update Product';
                productToEditId = productId;
            }
        }
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteConfirmModal.style.display = 'none';
        productIdToDelete = null;
    });

    confirmDeleteBtn.addEventListener('click', () => {
        if (productIdToDelete) {
            deleteProduct(productIdToDelete);
            deleteConfirmModal.style.display = 'none';
            productIdToDelete = null;
        }
    });

    downloadProductsBtn.addEventListener('click', () => {
        downloadJsonFile();
    });

    // Initial render
    getProductsFromLocalStorage();
    renderAllProductViews();
    renderCart();

});