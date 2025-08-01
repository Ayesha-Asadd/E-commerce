     let cart = []; // In-memory representation of the cart
        let currentView = 'products'; // To manage which view is displayed

        const appContainer = document.getElementById('app-container');
        const cartCountSpan = document.getElementById('cart-count');
        
        // Modal elements
        const customModal = document.getElementById('custom-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const modalConfirmBtn = document.getElementById('modal-confirm');
        const modalCancelBtn = document.getElementById('modal-cancel');
        let modalCallback = null;

        // --- Helper Functions for localStorage ---
        const getCartFromLocalStorage = () => {
            try {
                const storedCart = localStorage.getItem('ecommerceCart');
                return storedCart ? JSON.parse(storedCart) : [];
            } catch (e) {
                console.error("Error parsing cart from localStorage:", e);
                return [];
            }
        };

        const saveCartToLocalStorage = (cartData) => {
            try {
                localStorage.setItem('ecommerceCart', JSON.stringify(cartData));
                updateCartCount();
            } catch (e) {
                console.error("Error saving cart to localStorage:", e);
            }
        };

        const updateCartCount = () => {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountSpan.textContent = totalItems;
        };

        // --- Product Data Loading ---
        // The original fetch function has been replaced with a simple function
        // that uses the hardcoded `products` array.
        const loadProducts = async () => {
            try {
                // Since products are hardcoded, we can just proceed.
                renderView(currentView);
            } catch (error) {
                console.error("Could not load products:", error);
                appContainer.innerHTML = `<p class="text-red-500 text-center">Error loading products: ${error.message}</p>`;
            }
        };

        // --- Custom Modal Functions (replaces alert/confirm) ---
        const showMessage = (message, title = 'Notification') => {
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            modalConfirmBtn.textContent = 'OK';
            modalCancelBtn.style.display = 'none';
            customModal.style.display = 'flex';
            modalCallback = () => { customModal.style.display = 'none'; };
        };

        const showConfirmation = (message, title = 'Confirmation') => {
            return new Promise((resolve) => {
                modalTitle.textContent = title;
                modalMessage.textContent = message;
                modalConfirmBtn.textContent = 'Yes';
                modalCancelBtn.style.display = 'inline-block';
                customModal.style.display = 'flex';
                
                modalCallback = (action) => {
                    customModal.style.display = 'none';
                    resolve(action === 'confirm');
                };
            });
        };

        modalConfirmBtn.addEventListener('click', () => {
            if (modalCallback) modalCallback('confirm');
        });

        modalCancelBtn.addEventListener('click', () => {
            if (modalCallback) modalCallback('cancel');
        });

        // --- Rendering Functions ---
        const renderProductList = () => {
            appContainer.innerHTML = '<h2 class="text-center text-3xl font-bold mb-8">Our Products</h2>';
            const productListDiv = document.createElement('div');
            productListDiv.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';

            if (products.length === 0) {
                productListDiv.innerHTML = '<p class="text-center w-full text-gray-500">No products available.</p>';
            } else {
                products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.className = 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col';
                    productCard.innerHTML = `
                        <img src="${product.imageUrl}" alt="${product.name}" class="w-full h-48 object-cover border-b border-gray-200">
                        <div class="p-4 flex flex-col flex-grow">
                            <h3 class="text-xl font-semibold mb-2">${product.name}</h3>
                            <p class="text-sm text-gray-600 flex-grow mb-4">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
                            <p class="text-2xl font-bold text-[#333446] mt-auto">$${product.price.toFixed(2)}</p>
                        </div>
                        <button class="bg-[#333446] text-white font-bold py-3 px-6 hover:bg-[#B8CFCE] transition-colors duration-300 rounded-b-xl" data-product-id="${product.id}">View Details</button>
                    `;
                    productListDiv.appendChild(productCard);

                    productCard.querySelector('button').addEventListener('click', () => {
                        renderView('product-detail', product.id);
                    });
                });
            }
            appContainer.appendChild(productListDiv);
        };

        const renderProductDetail = (productId) => {
            const product = products.find(p => p.id === productId);
            if (!product) {
                appContainer.innerHTML = `
                    <p class="text-center text-red-500">Product not found.</p>
                    <button id="back-to-products-btn" class="mt-4 mx-auto block bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                        Back to Products
                    </button>
                `;
                document.getElementById('back-to-products-btn').addEventListener('click', () => renderView('products'));
                return;
            }

            appContainer.innerHTML = `
                <div class="bg-white rounded-xl shadow-lg p-8 md:p-12">
                    <button id="back-to-products-btn" class="mb-6 flex items-center text-blue-500 hover:text-blue-600 transition-colors">
                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                        Back to Products
                    </button>
                    <div class="flex flex-col md:flex-row gap-8">
                        <div class="md:w-1/2">
                            <img src="${product.imageUrl}" alt="${product.name}" class="w-full h-96 object-cover rounded-lg shadow-md">
                        </div>
                        <div class="md:w-1/2 flex flex-col">
                            <h2 class="text-4xl font-bold mb-4">${product.name}</h2>
                            <p class="text-lg text-gray-700 mb-6">${product.description}</p>
                            <p class="text-5xl font-bold text-[#333446] mb-6">$${product.price.toFixed(2)}</p>
                            <div class="flex flex-wrap items-center gap-4 mb-8">
                                ${product.variants && product.variants.length > 0 ? `
                                    <label for="variant-select" class="font-semibold text-lg">Choose Option:</label>
                                    <select id="variant-select" class="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        ${product.variants.map(variant => {
                                            const variantKey = Object.keys(variant).find(key => key !== 'sku');
                                            return `<option value="${variant.sku}">${variant[variantKey]}</option>`;
                                        }).join('')}
                                    </select>
                                ` : ''}
                                <label for="quantity-input" class="font-semibold text-lg">Quantity:</label>
                                <input type="number" id="quantity-input" value="1" min="1" class="p-3 w-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <button id="add-to-cart-btn" class="bg-blue-500 text-white font-bold py-4 px-8 rounded-lg text-xl hover:bg-blue-600 transition-colors shadow-lg">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('back-to-products-btn').addEventListener('click', () => {
                renderView('products');
            });

            document.getElementById('add-to-cart-btn').addEventListener('click', () => {
                const quantityInput = document.getElementById('quantity-input');
                const quantity = parseInt(quantityInput.value, 10);
                
                if (isNaN(quantity) || quantity <= 0) {
                    showMessage('Please enter a valid quantity (must be at least 1).', 'Invalid Quantity');
                    return;
                }

                const variantSelect = document.getElementById('variant-select');
                let selectedVariant = null;

                if (variantSelect && product.variants && product.variants.length > 0) {
                    const selectedSku = variantSelect.value;
                    selectedVariant = product.variants.find(v => v.sku === selectedSku);
                }

                addToCart(product, quantity, selectedVariant);
                const variantDisplay = selectedVariant ? ` (${Object.values(selectedVariant).find(v => v !== selectedVariant.sku)})` : '';
                showMessage(`${quantity} x ${product.name}${variantDisplay} added to cart!`, 'Item Added');
            });
        };

        const renderCart = () => {
            appContainer.innerHTML = `
                <div class="bg-white rounded-xl shadow-lg p-8">
                    <h2 class="text-center text-3xl font-bold mb-8">Your Shopping Cart</h2>
                    <div id="cart-items-container" class="mb-8">
                        ${cart.length === 0 ? '<p class="text-center text-gray-500">Your cart is empty.</p>' : ''}
                    </div>
                    <div class="flex justify-end items-center border-t border-gray-200 pt-6">
                        <span class="text-2xl font-bold mr-4">Total: $<span id="cart-total">0.00</span></span>
                        <button id="proceed-to-checkout-btn" class="bg-[#333446] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#415E72] transition-colors" ${cart.length === 0 ? 'disabled' : ''}>
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            `;

            const cartItemsContainer = document.getElementById('cart-items-container');
            let total = 0;

            cart.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) {
                    console.warn(`Product with ID ${item.productId} not found.`);
                    return;
                }

                const itemTotal = product.price * item.quantity;
                total += itemTotal;

                const variantDisplay = item.variant ? Object.values(item.variant).find(v => v !== item.variant.sku) : '';

                const cartItemDiv = document.createElement('div');
                cartItemDiv.className = 'flex items-center justify-between border-b border-gray-200 py-4';
                cartItemDiv.innerHTML = `
                    <div class="flex items-center space-x-4 flex-grow">
                        <img src="${product.imageUrl}" alt="${product.name}" class="w-20 h-20 object-cover rounded-lg">
                        <div class="flex-grow">
                            <h4 class="text-lg font-semibold">${product.name} ${variantDisplay ? `(${variantDisplay})` : ''}</h4>
                            <p class="text-sm text-gray-500">Price: $${product.price.toFixed(2)}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <label for="qty-${item.productId}-${item.variant ? item.variant.sku : ''}" class="text-sm font-medium">Qty:</label>
                            <input type="number" id="qty-${item.productId}-${item.variant ? item.variant.sku : ''}" value="${item.quantity}" min="1" 
                                class="w-16 p-2 border border-gray-300 rounded-lg text-center" 
                                data-product-id="${item.productId}" 
                                data-variant-sku="${item.variant ? item.variant.sku : ''}">
                        </div>
                        <span class="text-lg font-bold w-20 text-right">$${itemTotal.toFixed(2)}</span>
                        <button data-product-id="${item.productId}" data-variant-sku="${item.variant ? item.variant.sku : ''}" class="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                        </button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemDiv);

                cartItemDiv.querySelector('input').addEventListener('change', (e) => {
                    const newQuantity = parseInt(e.target.value, 10);
                    const productId = e.target.dataset.productId;
                    const variantSku = e.target.dataset.variantSku;
                    updateCartItemQuantity(productId, variantSku, newQuantity);
                });

                cartItemDiv.querySelector('button').addEventListener('click', (e) => {
                    const productId = e.target.dataset.productId;
                    const variantSku = e.target.dataset.variantSku;
                    removeFromCart(productId, variantSku);
                });
            });

            document.getElementById('cart-total').textContent = total.toFixed(2);
            document.getElementById('proceed-to-checkout-btn').addEventListener('click', () => renderView('checkout'));
        };

        const renderCheckout = () => {
            appContainer.innerHTML = `
                <div class="bg-white rounded-xl shadow-lg p-8">
                    <h2 class="text-center text-3xl font-bold mb-8">Checkout Summary</h2>
                    <div id="checkout-items-container" class="space-y-4 mb-8"></div>
                    <div class="flex justify-between items-center text-2xl font-bold border-t border-gray-200 pt-6 mt-6">
                        <span>Total:</span>
                        <span>$<span id="checkout-total-amount">0.00</span></span>
                    </div>
                    <h3 class="text-xl font-semibold mt-8 mb-4">Shipping Information (Simulated)</h3>
                    <form id="checkout-form" class="space-y-4">
                        <div>
                            <label for="name" class="block text-sm font-medium text-gray-700">Name:</label>
                            <input type="text" id="name" class="mt-1 block w-full p-3 border border-gray-300 rounded-lg" required>
                        </div>
                        <div>
                            <label for="address" class="block text-sm font-medium text-gray-700">Address:</label>
                            <input type="text" id="address" class="mt-1 block w-full p-3 border border-gray-300 rounded-lg" required>
                        </div>
                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700">Email:</label>
                            <input type="email" id="email" class="mt-1 block w-full p-3 border border-gray-300 rounded-lg" required>
                        </div>
                        <button type="submit" class="w-full bg-[#7F8CAA] text-white font-bold py-3 rounded-lg hover:bg-[#415E72] transition-colors shadow-md">
                            Place Order
                        </button>
                    </form>
                </div>
            `;

            const checkoutItemsContainer = document.getElementById('checkout-items-container');
            let total = 0;

            cart.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return;

                const itemTotal = product.price * item.quantity;
                total += itemTotal;
                const variantDisplay = item.variant ? Object.values(item.variant).find(v => v !== item.variant.sku) : '';


                const checkoutItemDiv = document.createElement('div');
                checkoutItemDiv.className = 'flex justify-between text-lg';
                checkoutItemDiv.innerHTML = `
                    <span>${item.quantity} x ${product.name} ${variantDisplay ? `(${variantDisplay})` : ''}</span>
                    <span>$${itemTotal.toFixed(2)}</span>
                `;
                checkoutItemsContainer.appendChild(checkoutItemDiv);
            });

            document.getElementById('checkout-total-amount').textContent = total.toFixed(2);

            document.getElementById('checkout-form').addEventListener('submit', (e) => {
                e.preventDefault();
                showMessage('Order Placed Successfully! (This is a simulated checkout)', 'Order Confirmation');
                cart = []; // Clear cart after simulated checkout
                saveCartToLocalStorage(cart);
                renderView('products'); // Redirect to products
            });
        };

        const renderAdminPanel = () => {
            appContainer.innerHTML = `
                <div class="bg-white rounded-xl shadow-lg p-8">
                    <h2 class="text-center text-3xl font-bold mb-8">Admin Panel</h2>
                    <div class="flex justify-end gap-4 mb-8">
                        <button id="add-new-product-btn" class="bg-[#333446] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#333446]-600 transition-colors">
                            Add New Product
                        </button>
                        <button id="download-products-json-btn" class="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Download products.json
                        </button>
                    </div>
                    <h3 class="text-xl font-semibold mb-4">Current Products</h3>
                    <div class="space-y-4" id="admin-product-list"></div>

                    <div class="bg-gray-100 border-2 border-dashed border-gray-300 p-6 rounded-lg mt-8 hidden" id="admin-product-form">
                        <h3 class="text-2xl font-semibold mb-4" id="form-title">Add/Edit Product</h3>
                        <input type="hidden" id="admin-product-id">
                        <form class="space-y-4">
                            <div>
                                <label for="admin-name" class="block text-sm font-medium text-gray-700">Name:</label>
                                <input type="text" id="admin-name" class="mt-1 block w-full p-3 border border-gray-300 rounded-lg" required>
                            </div>
                            <div>
                                <label for="admin-description" class="block text-sm font-medium text-gray-700">Description:</label>
                                <textarea id="admin-description" rows="4" class="mt-1 block w-full p-3 border border-gray-300 rounded-lg" required></textarea>
                            </div>
                            <div>
                                <label for="admin-price" class="block text-sm font-medium text-gray-700">Price:</label>
                                <input type="number" id="admin-price" step="0.01" class="mt-1 block w-full p-3 border border-gray-300 rounded-lg" required>
                            </div>
                            <div>
                                <label for="admin-imageUrl" class="block text-sm font-medium text-gray-700">Image URL:</label>
                                <input type="text" id="admin-imageUrl" class="mt-1 block w-full p-3 border border-gray-300 rounded-lg" required>
                            </div>
                            <h4 class="text-lg font-semibold mt-6 mb-2">Variants (e.g., Color, Size)</h4>
                            <div id="admin-variants-container" class="space-y-3"></div>
                            <button type="button" id="add-variant-btn" class="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                                Add Variant
                            </button>
                            <div class="flex justify-end space-x-4 mt-6">
                                <button type="button" id="cancel-edit-btn" class="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                                    Cancel
                                </button>
                                <button type="button" id="save-product-btn" class="bg-[#333446] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#415E72] transition-colors">
                                    Save Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            const adminProductList = document.getElementById('admin-product-list');
            const adminProductForm = document.getElementById('admin-product-form');
            const adminVariantsContainer = document.getElementById('admin-variants-container');
            let editingProductId = null;

            const displayAdminProducts = () => {
                adminProductList.innerHTML = '';
                if (products.length === 0) {
                    adminProductList.innerHTML = '<p class="text-center text-gray-500">No products in the list.</p>';
                }
                products.forEach(product => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'flex items-center justify-between p-2 bg-white rounded-lg shadow-sm';
                    itemDiv.innerHTML = `
                        <div class="flex items-center space-x-4">
                            <img src="${product.imageUrl}" alt="${product.name}" class="w-16 h-16 object-cover rounded-lg">
                            <div>
                                <h4 class="font-semibold">${product.name}</h4>
                                <p class="text-sm text-gray-600">$${product.price.toFixed(2)}</p>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button data-id="${product.id}" class="edit-product-btn bg-yellow-400 text-white p-2 rounded-lg hover:bg-yellow-500 transition-colors">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.794.793a4.015 4.015 0 01-1.042 1.042l-2.036 2.036a.75.75 0 01-1.06-.01l-.775-.775 3.036-3.036-.775-.775a.75.75 0 01-.01-1.06L13.586 3.586z"></path><path fill-rule="evenodd" d="M2 13.5V18a2 2 0 002 2h4.5a2 2 0 002-2v-4.5a.5.5 0 00-1 0V18h-4v-4h4.5a.5.5 0 000-1H4a2 2 0 00-2 2z"></path></svg>
                            </button>
                            <button data-id="${product.id}" class="delete-product-btn bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                            </button>
                        </div>
                    `;
                    adminProductList.appendChild(itemDiv);
                });

                document.querySelectorAll('.edit-product-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        // Find the button's ancestor with the data-id attribute
                        const targetButton = e.target.closest('.edit-product-btn');
                        if (!targetButton) return;

                        editingProductId = targetButton.dataset.id;
                        const productToEdit = products.find(p => p.id === editingProductId);
                        
                        if (productToEdit) {
                            document.getElementById('form-title').textContent = 'Edit Product';
                            document.getElementById('admin-product-id').value = productToEdit.id;
                            document.getElementById('admin-name').value = productToEdit.name;
                            document.getElementById('admin-description').value = productToEdit.description;
                            document.getElementById('admin-price').value = productToEdit.price;
                            document.getElementById('admin-imageUrl').value = productToEdit.imageUrl;

                            adminVariantsContainer.innerHTML = '';
                            if (productToEdit.variants && productToEdit.variants.length > 0) {
                                productToEdit.variants.forEach(variant => {
                                    const variantKey = Object.keys(variant).find(key => key !== 'sku');
                                    addVariantInput(variant[variantKey], variant.sku);
                                });
                            } else {
                                addVariantInput(); // Add a blank variant row for new variants
                            }
                            adminProductForm.classList.remove('hidden');
                        }
                    });
                });

                document.querySelectorAll('.delete-product-btn').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const targetButton = e.target.closest('.delete-product-btn');
                        if (!targetButton) return;

                        const idToDelete = targetButton.dataset.id;
                        const confirmation = await showConfirmation('Are you sure you want to delete this product? This action is in-memory only until you download the JSON.', 'Delete Product');
                        if (confirmation) {
                            products = products.filter(p => p.id !== idToDelete);
                            displayAdminProducts();
                            showMessage('Product deleted (in-memory). Download JSON to persist changes.', 'Product Deleted');
                        }
                    });
                });
            };

            const addVariantInput = (value = '', sku = '') => {
                const variantGroup = document.createElement('div');
                variantGroup.className = 'flex items-center space-x-2 p-3 bg-gray-200 rounded-lg';
                variantGroup.innerHTML = `
                    <input type="text" class="variant-value flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value="${value}" required placeholder="Option Value (e.g., Red, Small)">
                    <input type="text" class="variant-sku flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value="${sku}" required placeholder="SKU (e.g., P001-RED)">
                    <button type="button" class="remove-variant-btn bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                    </button>
                `;
                adminVariantsContainer.appendChild(variantGroup);

                variantGroup.querySelector('.remove-variant-btn').addEventListener('click', () => {
                    variantGroup.remove();
                });
            };

            document.getElementById('add-new-product-btn').addEventListener('click', () => {
                editingProductId = null;
                const form = document.getElementById('admin-product-form').querySelector('form');
                form.reset();
                document.getElementById('form-title').textContent = 'Add New Product';
                document.getElementById('admin-product-id').value = '';
                adminVariantsContainer.innerHTML = '';
                addVariantInput();
                adminProductForm.classList.remove('hidden');
            });

            document.getElementById('add-variant-btn').addEventListener('click', () => addVariantInput());

            document.getElementById('save-product-btn').addEventListener('click', () => {
                const idInput = document.getElementById('admin-product-id');
                const nameInput = document.getElementById('admin-name');
                const descriptionInput = document.getElementById('admin-description');
                const priceInput = document.getElementById('admin-price');
                const imageUrlInput = document.getElementById('admin-imageUrl');

                const id = idInput.value || 'p' + Date.now();
                const name = nameInput.value.trim();
                const description = descriptionInput.value.trim();
                const price = parseFloat(priceInput.value);
                const imageUrl = imageUrlInput.value.trim();

                const variants = [];
                let allVariantsValid = true;
                document.querySelectorAll('.variant-group').forEach(group => {
                    const valueInput = group.querySelector('.variant-value');
                    const skuInput = group.querySelector('.variant-sku');
                    const value = valueInput.value.trim();
                    const sku = skuInput.value.trim();

                    if (value || sku) {
                        if (!value || !sku) {
                            allVariantsValid = false;
                            showMessage('Both Option Value and SKU must be filled for each variant, or both left empty.', 'Validation Error');
                            return;
                        }
                        const variantKey = value.toLowerCase().includes('size') || value.length <= 3 ? 'size' : 'color';
                        variants.push({ [variantKey]: value, sku: sku });
                    }
                });

                if (!allVariantsValid) return;

                if (!name || !description || isNaN(price) || price <= 0 || !imageUrl) {
                    showMessage('Please fill in all required product fields (Name, Description, Price, Image URL) and ensure Price is a positive number.', 'Validation Error');
                    return;
                }

                const newProduct = { 
                    id, 
                    name, 
                    description, 
                    price, 
                    imageUrl, 
                    variants: variants.length > 0 ? variants : undefined 
                };

                if (editingProductId) {
                    products = products.map(p => p.id === editingProductId ? newProduct : p);
                    showMessage('Product updated (in-memory). Remember to download JSON to persist changes.', 'Product Updated');
                } else {
                    if (products.some(p => p.id === newProduct.id)) {
                        showMessage('A product with this ID already exists. Please try again or provide a unique ID.', 'Error');
                        return;
                    }
                    products.push(newProduct);
                    showMessage('Product added (in-memory). Remember to download JSON to persist changes.', 'Product Added');
                }

                adminProductForm.classList.add('hidden');
                displayAdminProducts();
            });

            document.getElementById('cancel-edit-btn').addEventListener('click', () => {
                adminProductForm.classList.add('hidden');
                editingProductId = null;
            });

            document.getElementById('download-products-json-btn').addEventListener('click', () => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", "products.json");
                document.body.appendChild(downloadAnchorNode); 
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
                showMessage('products.json downloaded. You need to manually replace the file in your project folder to save changes permanently!', 'Download Complete');
            });

            displayAdminProducts();
        };

        // --- Cart Actions ---
        const addToCart = (product, quantity, variant) => {
            const itemIdentifier = `${product.id}-${variant ? variant.sku : 'no-variant'}`;

            const existingItemIndex = cart.findIndex(item => {
                const existingItemIdentifier = `${item.productId}-${item.variant ? item.variant.sku : 'no-variant'}`;
                return existingItemIdentifier === itemIdentifier;
            });

            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += quantity;
            } else {
                cart.push({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    variant: variant,
                    quantity: quantity
                });
            }
            saveCartToLocalStorage(cart);
            updateCartCount();
        };

        const updateCartItemQuantity = (productId, variantSku, newQuantity) => {
            const itemIndex = cart.findIndex(item =>
                item.productId === productId &&
                (item.variant ? item.variant.sku : 'no-variant') === variantSku
            );

            if (itemIndex > -1) {
                if (newQuantity <= 0) {
                    removeFromCart(productId, variantSku, false);
                } else {
                    cart[itemIndex].quantity = newQuantity;
                    saveCartToLocalStorage(cart);
                    if (currentView === 'cart') {
                        renderCart();
                    }
                }
            }
        };

        const removeFromCart = async (productId, variantSku, askConfirmation = true) => {
            let confirmed = true;
            if (askConfirmation) {
                confirmed = await showConfirmation('Are you sure you want to remove this item from your cart?', 'Remove Item');
            }

            if (confirmed) {
                cart = cart.filter(item => !(item.productId === productId && (item.variant ? item.variant.sku : 'no-variant') === variantSku));
                saveCartToLocalStorage(cart);
                if (currentView === 'cart') {
                    renderCart();
                }
                if (askConfirmation) {
                    showMessage('Item removed from cart.', 'Item Removed');
                }
            }
        };

        // --- View Management ---
        const renderView = (viewName, data = null) => {
            currentView = viewName;
            appContainer.innerHTML = '';

            switch (viewName) {
                case 'products':
                    renderProductList();
                    break;
                case 'product-detail':
                    renderProductDetail(data);
                    break;
                case 'cart':
                    renderCart();
                    break;
                case 'checkout':
                    renderCheckout();
                    break;
                case 'admin':
                    renderAdminPanel();
                    break;
                default:
                    renderProductList();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        // --- Event Listeners for Navigation Buttons ---
        document.getElementById('view-products-btn').addEventListener('click', () => renderView('products'));
        document.getElementById('view-cart-btn').addEventListener('click', () => renderView('cart'));
        document.getElementById('view-admin-btn').addEventListener('click', () => renderView('admin'));

        // --- Initial Load ---
        document.addEventListener('DOMContentLoaded', () => {
            cart = getCartFromLocalStorage();
            updateCartCount();
            loadProducts();
        });
