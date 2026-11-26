
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
const POINTS_KEY = "cozyCoffeePoints";
const ORDERS_KEY = "cozyCoffeeOrders";
const COUPON_KEY = "cozyCoffeeCoupon";

function getLoyaltyPoints() {
    return Number(localStorage.getItem(POINTS_KEY)) || 0;
}

function updateLoyaltyDisplay(cartTotal = 0) {
    const pointsElement = document.getElementById("loyaltyPoints");
    const earningElement = document.getElementById("pointsToEarn");
    if (pointsElement) pointsElement.textContent = getLoyaltyPoints() + " pts";
    if (earningElement) earningElement.textContent = Math.floor(cartTotal / 10) + " pts";
}

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

        const subtotal = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
        const discount = calculateDiscount(subtotal, getActiveCoupon());
        const total = Math.max(0, subtotal - discount);
        const discountElement = document.getElementById("cartDiscount");
        if (discountElement) discountElement.textContent = "-" + formatPrice(discount);

        const subtotalElement = document.getElementById("cartSubtotal");
        const totalElement = document.getElementById("cartTotal");

        if (subtotalElement) {
            subtotalElement.textContent = formatPrice(total);
        }

        if (totalElement) {
            totalElement.textContent = formatPrice(total);
        }

        updateLoyaltyDisplay(total);

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

const paymentDetails = document.getElementById("paymentDetails");
document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
    input.addEventListener("change", () => {
        if (!paymentDetails) return;
        const notes = {
            "InstaPay": "InstaPay selected. Transfer instructions and the payment reference will be provided by the store. This demo does not verify transfers.",
            "Vodafone Cash": "Vodafone Cash selected. Wallet transfer details will be provided by the store. This demo does not verify transfers.",
            "Visa": "Visa selected. This is a demo checkout only; no card details are collected and no real payment is processed.",
            "Cash on Delivery": "Cash on Delivery selected. Please pay the order total in cash when your order arrives."
        };
        paymentDetails.textContent = notes[input.value] || "";
    });
});

const checkoutButton = document.getElementById("checkoutBtn");

if (checkoutButton) {

    checkoutButton.addEventListener("click", () => {

        const message = document.getElementById("checkoutMessage");

        if (getCart().length === 0) {

            message.textContent = "Your cart is empty.";
            message.className = "form-message error";

            return;
        }

        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
        if (!selectedPayment) {
            message.textContent = "Please choose a payment method.";
            message.className = "form-message error";
            return;
        }

        const paymentMethod = selectedPayment.value;
        const cart = getCart();
        const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
        const appliedCoupon = getActiveCoupon();
        const discount = calculateDiscount(subtotal, appliedCoupon);
        const orderTotal = Math.max(0, subtotal - discount);
        const earnedPoints = Math.floor(orderTotal / 10);
        const newBalance = getLoyaltyPoints() + earnedPoints;
        const orderNumber = "CC-" + Date.now().toString().slice(-8);
        const orders = getOrders();
        orders.push({
            orderNumber,
            items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
            subtotal,
            discount,
            coupon: appliedCoupon,
            total: orderTotal,
            paymentMethod,
            status: "received",
            createdAt: new Date().toISOString()
        });
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

        localStorage.setItem(POINTS_KEY, String(newBalance));
        saveCart([]);
        localStorage.removeItem(COUPON_KEY);
        if (cartItemsElement) {
            cartItemsElement.innerHTML = '<div class="empty-cart"><h2>Thank you for your order!</h2><p>Your demo order has been placed successfully.</p><a class="btn" href="services.html">Explore the Menu</a></div>';
        }
        const subtotalElement = document.getElementById("cartSubtotal");
        const totalElement = document.getElementById("cartTotal");
        if (subtotalElement) subtotalElement.textContent = formatPrice(0);
        if (totalElement) totalElement.textContent = formatPrice(0);
        const discountElement = document.getElementById("cartDiscount");
        if (discountElement) discountElement.textContent = formatPrice(0);
        const couponMessage = document.getElementById("couponMessage");
        if (couponMessage) couponMessage.textContent = "";
        updateLoyaltyDisplay(0);

        message.textContent = "Thank you! Order " + orderNumber + " placed using " + paymentMethod + ". You earned " + earnedPoints + " Cozy Rewards points. Your new balance is " + newBalance + " points. Use the order number below to track it.";
        const trackingInput = document.getElementById("trackingNumber");
        if (trackingInput) trackingInput.value = orderNumber;
        const trackingForm = document.getElementById("trackingForm");
        if (trackingForm) trackingForm.requestSubmit();
        message.className = "form-message success";

    });

}


// ================= CUSTOMER REVIEWS =================

const REVIEWS_KEY = "cozyCoffeeReviews";
const reviewForm = document.getElementById("reviewForm");

function getReviews() {
    try {
        const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY));
        return Array.isArray(reviews) ? reviews : [];
    } catch (error) {
        return [];
    }
}

function renderReviews() {
    const list = document.getElementById("reviewsList");
    if (!list) return;

    const reviews = getReviews();
    const averageElement = document.getElementById("reviewAverage");
    const averageStars = document.getElementById("reviewAverageStars");
    const countElement = document.getElementById("reviewCount");

    if (reviews.length === 0) {
        list.innerHTML = '<p class="no-reviews">Be the first to leave a review!</p>';
        if (averageElement) averageElement.textContent = "—";
        if (averageStars) averageStars.textContent = "☆☆☆☆☆";
        if (countElement) countElement.textContent = "No reviews yet";
        return;
    }

    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    if (averageElement) averageElement.textContent = average.toFixed(1) + " / 5";
    if (averageStars) averageStars.textContent = "★".repeat(Math.round(average)) + "☆".repeat(5 - Math.round(average));
    if (countElement) countElement.textContent = reviews.length + (reviews.length === 1 ? " review" : " reviews");

    list.replaceChildren();
    reviews.slice().reverse().forEach(review => {
        const card = document.createElement("article");
        card.className = "review-card";

        const name = document.createElement("h4");
        name.textContent = review.name;

        const stars = document.createElement("span");
        stars.className = "review-stars";
        stars.textContent = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
        stars.setAttribute("aria-label", review.rating + " out of 5 stars");

        const comment = document.createElement("p");
        comment.textContent = review.comment;

        card.append(name, stars, comment);
        list.appendChild(card);
    });
}

if (reviewForm) {
    reviewForm.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("reviewName").value.trim();
        const rating = Number(document.getElementById("reviewRating").value);
        const comment = document.getElementById("reviewText").value.trim();
        const message = document.getElementById("reviewMessage");

        if (!name || !comment || rating < 1 || rating > 5) {
            message.textContent = "Please complete all review fields.";
            message.className = "form-message error";
            return;
        }

        const reviews = getReviews();
        reviews.push({ name, rating, comment });
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));

        reviewForm.reset();
        message.textContent = "Thank you! Your review has been added.";
        message.className = "form-message success";
        renderReviews();
    });

    renderReviews();
}


// ================= ORDER TRACKING =================


function getOrders() {
    try {
        const orders = JSON.parse(localStorage.getItem(ORDERS_KEY));
        return Array.isArray(orders) ? orders : [];
    } catch (error) {
        return [];
    }
}

const trackingForm = document.getElementById("trackingForm");
if (trackingForm) {
    trackingForm.addEventListener("submit", event => {
        event.preventDefault();
        const orderNumber = document.getElementById("trackingNumber").value.trim().toUpperCase();
        const result = document.getElementById("trackingResult");
        const order = getOrders().find(item => item.orderNumber.toUpperCase() === orderNumber);

        if (!order) {
            result.innerHTML = '<p class="tracking-error">We could not find this order. Check the number and try again on the same browser where you placed it.</p>';
            return;
        }

        const date = new Date(order.createdAt).toLocaleString();
        const itemsHtml = order.items.map(item =>
            '<li>' + escapeTrackingText(item.name) + ' × ' + item.quantity + '</li>'
        ).join("");

        result.innerHTML =
            '<div class="tracking-card">' +
                '<div class="tracking-card-heading"><div><span class="tracking-label">ORDER NUMBER</span><h3>' + order.orderNumber + '</h3></div><span class="tracking-status">Order Received</span></div>' +
                '<p class="tracking-date">Placed: ' + date + '</p>' +
                '<div class="tracking-progress"><div class="tracking-step active"><span>1</span><strong>Received</strong></div><div class="tracking-step"><span>2</span><strong>Preparing</strong></div><div class="tracking-step"><span>3</span><strong>On the way</strong></div><div class="tracking-step"><span>4</span><strong>Delivered</strong></div></div>' +
                '<h4>Order items</h4><ul>' + itemsHtml + '</ul>' +
                '<p class="tracking-total">Order total: <strong>' + formatPrice(order.total) + '</strong></p>' +
                '<p class="tracking-demo-note">Your order is recorded as received in this demo. The later stages need a real order-management system to update.</p>' +
            '</div>';
    });
}

function escapeTrackingText(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[character]));
}

 
// ================= PROMO CODES =================

function getActiveCoupon() {
    return (localStorage.getItem(COUPON_KEY) || "").toUpperCase();
}

function calculateDiscount(subtotal, coupon) {
    if (coupon === "COZY10") return Math.round(subtotal * 0.10);
    if (coupon === "COZY15" && subtotal >= 200) return Math.round(subtotal * 0.15);
    return 0;
}

const couponForm = document.getElementById("couponForm");
if (couponForm) {
    const couponInput = document.getElementById("couponCode");
    const couponMessage = document.getElementById("couponMessage");
    const savedCoupon = getActiveCoupon();
    if (savedCoupon && couponInput) couponInput.value = savedCoupon;

    couponForm.addEventListener("submit", event => {
        event.preventDefault();
        const code = couponInput.value.trim().toUpperCase();
        const subtotal = getCart().reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

        if (code === "COZY10") {
            localStorage.setItem(COUPON_KEY, code);
            couponMessage.textContent = "Success! 10% discount applied.";
            couponMessage.className = "coupon-message success";
        } else if (code === "COZY15" && subtotal >= 200) {
            localStorage.setItem(COUPON_KEY, code);
            couponMessage.textContent = "Great! 15% discount applied.";
            couponMessage.className = "coupon-message success";
        } else if (code === "COZY15") {
            localStorage.removeItem(COUPON_KEY);
            couponMessage.textContent = "COZY15 is valid on orders of EGP 200 or more.";
            couponMessage.className = "coupon-message error";
        } else {
            localStorage.removeItem(COUPON_KEY);
            couponMessage.textContent = "Invalid promo code. Please try COZY10 or COZY15.";
            couponMessage.className = "coupon-message error";
        }

        const discount = calculateDiscount(subtotal, getActiveCoupon());
        const discountElement = document.getElementById("cartDiscount");
        const totalElement = document.getElementById("cartTotal");
        if (discountElement) discountElement.textContent = "-" + formatPrice(discount);
        if (totalElement) totalElement.textContent = formatPrice(Math.max(0, subtotal - discount));
        updateLoyaltyDisplay(Math.max(0, subtotal - discount));
    });
}
