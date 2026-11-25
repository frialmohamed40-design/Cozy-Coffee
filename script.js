
// ================= MENU BUTTON =================

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("active");

        menuBtn.setAttribute("aria-expanded", isOpen);
        menuBtn.textContent = isOpen ? "✕" : "☰";
    });

    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            menuBtn.textContent = "☰";
            menuBtn.setAttribute("aria-expanded", "false");
        });
    });
}


// ================= FOOTER YEAR =================

document.querySelectorAll(".year").forEach(item => {
    item.textContent = new Date().getFullYear();
});


// ================= CONTACT FORM =================

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        const formMessage = document.getElementById("formMessage");

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // FIXED: added || between conditions
        if (!name || !email || !message) {
            formMessage.textContent = "Please fill in all fields.";
            formMessage.className = "form-message error";
            return;
        }

        if (!emailPattern.test(email)) {
            formMessage.textContent = "Please enter a valid email address.";
            formMessage.className = "form-message error";
            return;
        }

        formMessage.textContent =
            "Thank you! Your message has been received.";

        formMessage.className = "form-message success";

        contactForm.reset();
    });
}


// ================= SHOPPING CART =================

const CART_KEY = "cozyCoffeeCart";

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatPrice(amount) {
    // FIXED: added template literal backticks
    return `EGP ${Number(amount).toLocaleString("en-EG")}`;
}


// ================= DRINK SIZE AND PRICE =================

document.querySelectorAll("[data-size-select]").forEach(select => {
    const card = select.closest(".coffee-card");
    const button = card ? card.querySelector(".add-cart-btn") : null;
    const priceLabel = card ? card.querySelector(".price") : null;

    if (!button || !priceLabel) return;

    const updateDrinkPrice = () => {
        const option = select.options[select.selectedIndex];
        const size = select.value;
        const price = Number(option.dataset.price);

        button.dataset.price = price;
        button.dataset.id = button.dataset.baseId + "-" + size;
        button.dataset.name = button.dataset.baseName + " (" + size.charAt(0).toUpperCase() + size.slice(1) + ")";
        priceLabel.textContent = formatPrice(price);
    };

    select.addEventListener("change", updateDrinkPrice);
    updateDrinkPrice();
});


// ================= ADD TO CART =================

document.querySelectorAll(".add-cart-btn").forEach(button => {

    button.addEventListener("click", () => {

        const cart = getCart();
        const id = button.dataset.id;
        const existing = cart.find(item => item.id === id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: id,
                name: button.dataset.name,
                price: Number(button.dataset.price),
                image: button.dataset.image,
                quantity: 1
            });
        }

        saveCart(cart);

        button.textContent = "Added ✓";

        setTimeout(() => {
            button.textContent = "Add to Cart";
        }, 1000);

    });

});


// ================= DISPLAY CART =================

const cartItemsElement = document.getElementById("cartItems");

if (cartItemsElement) {

    function renderCart() {

        const cart = getCart();

        if (cart.length === 0) {

            cartItemsElement.innerHTML = `
                <div class="empty-cart">
                    <h2>Your cart is empty</h2>
                    <p>You have not added any coffee yet.</p>
                    <a class="btn" href="services.html">
                        Explore the Menu
                    </a>
                </div>
            `;

        } else {

            cartItemsElement.innerHTML = cart.map(item => `

                <article class="cart-item">

                    <img src="${item.image}" alt="${item.name}">

                    <div>
                        <h3>${item.name}</h3>

                        <p>${formatPrice(item.price)} each</p>

                        <div class="quantity-controls">

                            <button data-action="decrease"
                                data-id="${item.id}">−</button>

                            <strong>${item.quantity}</strong>

                            <button data-action="increase"
                                data-id="${item.id}">+</button>

                        </div>
                    </div>

                    <div class="item-actions">

                        <strong>
                            ${formatPrice(item.price * item.quantity)}
                        </strong>

                        <br>

                        <button class="remove-btn"
                            data-action="remove"
                            data-id="${item.id}">
                            Remove
                        </button>

                    </div>

                </article>

            `).join("");

        }

        const total = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const subtotalElement = document.getElementById("cartSubtotal");
        const totalElement = document.getElementById("cartTotal");

        if (subtotalElement) {
            subtotalElement.textContent = formatPrice(total);
        }

        if (totalElement) {
            totalElement.textContent = formatPrice(total);
        }

    }


    // ================= QUANTITY AND REMOVE =================

    cartItemsElement.addEventListener("click", event => {

        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const cart = getCart();

        const item = cart.find(
            product => product.id === button.dataset.id
        );

        if (!item) return;

        if (button.dataset.action === "increase") {
            item.quantity++;
        }

        if (button.dataset.action === "decrease") {
            item.quantity--;
        }

        let updatedCart = cart.filter(
            product => product.quantity > 0
        );

        if (button.dataset.action === "remove") {
            updatedCart = cart.filter(
                product => product.id !== button.dataset.id
            );
        }

        saveCart(updatedCart);

        renderCart();

    });

    renderCart();

}


// ================= CHECKOUT =================

const checkoutButton = document.getElementById("checkoutBtn");

if (checkoutButton) {

    checkoutButton.addEventListener("click", () => {

        const message = document.getElementById("checkoutMessage");

        if (getCart().length === 0) {

            message.textContent = "Your cart is empty.";
            message.className = "form-message error";

            return;
        }

        message.textContent =
            "Thank you! This is a demo checkout.";

        message.className = "form-message success";

    });

}
