
$(document).ready(function () {

    function showToast(message, type = "success") {
        const toast = $(`<div class="toast-custom ${type}"><span></span></div>`);
        toast.find("span").text(message);
        $("#toastContainer").append(toast);

        setTimeout(function () {
            toast.fadeOut(300, function () {
                $(this).remove();
            });
        }, 3000);
    }

    function getCart() {
        try {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            return Array.isArray(cart) ? cart : [];
        } catch (error) {
            console.error("Cart loading error:", error);
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount(cart);
    }

    function updateCartCount(cart) {
        const count = cart.reduce(function (total, item) {
            return total + Number(item.quantity || 1);
        }, 0);

        $("#cartCount").text(count);
    }

    function renderCart() {
        if (!$("#cartItems").length) {
            return;
        }

        const cart = getCart();
        let total = 0;

        if (cart.length === 0) {
            $("#cartItems").html(`
                <div class="text-center py-5">
                    <h4 class="text-muted">Your cart is empty</h4>
                    <a href="menu.html" class="btn btn-main mt-3">
                        Browse Menu
                    </a>
                </div>
            `);

            $("#grandTotal").text("0");
            return;
        }

        let output = "";

        cart.forEach(function (item, index) {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 1;
            const itemTotal = price * quantity;

            total += itemTotal;

            output += `
                <div class="card mb-3 border-0 shadow-sm">
                    <div class="card-body d-flex justify-content-between align-items-center">

                        <div>
                            <h5 class="mb-1">${escapeHTML(item.name)}</h5>

                            <p class="mb-1 text-orange fw-bold">
                                ₹${price.toFixed(2)}
                            </p>

                            <div class="d-flex align-items-center gap-2">
                                <button
                                    class="btn btn-outline-secondary decreaseCartQty"
                                    data-index="${index}"
                                    type="button">
                                    -
                                </button>

                                <span>${quantity}</span>

                                <button
                                    class="btn btn-outline-secondary increaseCartQty"
                                    data-index="${index}"
                                    type="button">
                                    +
                                </button>
                            </div>

                            <p class="mb-0 mt-2 fw-bold">
                                Item Total: ₹${itemTotal.toFixed(2)}
                            </p>
                        </div>

                        <button
                            class="btn btn-danger removeItem"
                            data-index="${index}"
                            type="button"
                            style="border-radius: 8px;">
                            Remove
                        </button>

                    </div>
                </div>
            `;
        });

        $("#cartItems").html(output);
        $("#grandTotal").text(total.toFixed(2));
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            const characters = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return characters[character];
        });
    }

    $("#darkModeBtn").click(function () {
        $("body").toggleClass("dark-mode");

        if ($("body").hasClass("dark-mode")) {
            $(this)
                .text("Light Mode")
                .removeClass("btn-warning")
                .addClass("btn-light");
        } else {
            $(this)
                .text("Dark Mode")
                .removeClass("btn-light")
                .addClass("btn-warning");
        }
    });

    $(".category-card").hover(
        function () {
            $(this).css("transform", "translateY(-10px)");
        },
        function () {
            $(this).css("transform", "translateY(0)");
        }
    );

    $(".restaurant-card").hover(
        function () {
            $(this).css("transform", "translateY(-10px)");
        },
        function () {
            $(this).css("transform", "translateY(0)");
        }
    );

    $(document).on("click", ".btn-main", function () {
        $(this)
            .animate({ opacity: 0.8 }, 100)
            .animate({ opacity: 1 }, 100);
    });

    $("#searchInput, #heroSearchInput").on("keyup", function () {
        let value = $(this).val().toLowerCase();

        $(".restaurant-item").filter(function () {
            $(this).toggle(
                $(this).text().toLowerCase().indexOf(value) > -1
            );
        });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get("filter");

    if (filterParam) {
        let btn = $(`.filter-btn[data-filter="${filterParam}"]`);

        if (btn.length) {
            btn.click();
        }
    }

    $(".filter-btn").click(function () {
        $(".filter-btn").removeClass("active");
        $(this).addClass("active");

        let value = $(this).attr("data-filter");

        $("#restaurantsContainer").addClass("d-none");
        $("#shimmerContainer").removeClass("d-none");

        setTimeout(function () {
            $("#shimmerContainer").addClass("d-none");
            $("#restaurantsContainer").removeClass("d-none");

            if (value === "all") {
                $(".restaurant-item").show();
            } else {
                $(".restaurant-item").hide();
                $("." + value).show();
            }
        }, 500);
    });

    $(".increase").click(function () {
        let qty = parseInt($(".qty").text()) || 1;

        qty++;

        $(".qty").text(qty);
        $("#grandTotal").text(qty * 249);
        $(".itemTotal").text("₹" + qty * 249);
    });

    $(".decrease").click(function () {
        let qty = parseInt($(".qty").text()) || 1;

        if (qty > 1) {
            qty--;

            $(".qty").text(qty);
            $("#grandTotal").text(qty * 249);
            $(".itemTotal").text("₹" + qty * 249);
        }
    });

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validateMobile(mobile) {
        const re = /^\d{10}$/;
        return re.test(mobile);
    }

    function validateName(name) {
        return name.trim().length >= 3 &&
            /^[a-zA-Z\s]+$/.test(name);
    }

    function validateInput(inputEl, condition, feedbackId) {
        if (condition) {
            inputEl.addClass("is-valid").removeClass("is-invalid");
            $("#" + feedbackId).hide();
            return true;
        } else {
            inputEl.addClass("is-invalid").removeClass("is-valid");
            $("#" + feedbackId).show();
            return false;
        }
    }

    $("#name").on("input focusout", function () {
        validateInput(
            $(this),
            validateName($(this).val()),
            "nameFeedback"
        );
    });

    $("#mobile").on("input focusout", function () {
        validateInput(
            $(this),
            validateMobile($(this).val()),
            "mobileFeedback"
        );
    });

    $("#email").on("input focusout", function () {
        validateInput(
            $(this),
            validateEmail($(this).val()),
            "emailFeedback"
        );
    });

    $("#address").on("input focusout", function () {
        validateInput(
            $(this),
            $(this).val().trim().length >= 5,
            "addressFeedback"
        );
    });

    $("#checkoutForm").off("submit").on("submit", function (e) {
    e.preventDefault();

    let isNameValid = validateInput(
        $("#name"),
        validateName($("#name").val()),
        "nameFeedback"
    );

    let isMobileValid = validateInput(
        $("#mobile"),
        validateMobile($("#mobile").val()),
        "mobileFeedback"
    );

    let isEmailValid = validateInput(
        $("#email"),
        validateEmail($("#email").val()),
        "emailFeedback"
    );

    let isAddressValid = validateInput(
        $("#address"),
        $("#address").val().trim().length >= 5,
        "addressFeedback"
    );

    if (
        isNameValid &&
        isMobileValid &&
        isEmailValid &&
        isAddressValid
    ) {
        const cart = getCart();

        if (!Array.isArray(cart) || cart.length === 0) {
            showToast(
                "Your cart is empty. Please add items before placing an order.",
                "error"
            );
            return;
        }

        // Let checkout-api.js handle the backend order.
        // Do not clear the cart or show success here.
    } else {
        showToast("Please fix the errors in the form.", "error");
    }
});

    $("#contactName").on("input focusout", function () {
        validateInput(
            $(this),
            $(this).val().trim().length >= 3,
            "contactNameFeedback"
        );
    });

    $("#contactEmail").on("input focusout", function () {
        validateInput(
            $(this),
            validateEmail($(this).val()),
            "contactEmailFeedback"
        );
    });

    $("#contactSubject").on("input focusout", function () {
        validateInput(
            $(this),
            $(this).val().trim().length >= 5,
            "contactSubjectFeedback"
        );
    });

    $("#contactMessage").on("input focusout", function () {
        validateInput(
            $(this),
            $(this).val().trim().length >= 15,
            "contactMessageFeedback"
        );
    });

    $("#contactForm").submit(function (e) {
        e.preventDefault();

        let isNameValid = validateInput(
            $("#contactName"),
            $("#contactName").val().trim().length >= 3,
            "contactNameFeedback"
        );

        let isEmailValid = validateInput(
            $("#contactEmail"),
            validateEmail($("#contactEmail").val()),
            "contactEmailFeedback"
        );

        let isSubjectValid = validateInput(
            $("#contactSubject"),
            $("#contactSubject").val().trim().length >= 5,
            "contactSubjectFeedback"
        );

        let isMessageValid = validateInput(
            $("#contactMessage"),
            $("#contactMessage").val().trim().length >= 15,
            "contactMessageFeedback"
        );

        if (
            isNameValid &&
            isEmailValid &&
            isSubjectValid &&
            isMessageValid
        ) {
            showToast("Thank you! Your message has been sent.");

            this.reset();

            $(".form-control").removeClass("is-valid is-invalid");
        } else {
            showToast(
                "Please fill all contact fields correctly.",
                "error"
            );
        }
    });

    $("#loginEmail").on("input focusout", function () {
        validateInput(
            $(this),
            validateEmail($(this).val()),
            "loginEmailFeedback"
        );
    });

    $("#loginPassword").on("input focusout", function () {
        validateInput(
            $(this),
            $(this).val().length > 0,
            "loginPasswordFeedback"
        );
    });

    $("#loginBtn").click(function (e) {
        e.preventDefault();

        let isEmailValid = validateInput(
            $("#loginEmail"),
            validateEmail($("#loginEmail").val()),
            "loginEmailFeedback"
        );

        let isPasswordValid = validateInput(
            $("#loginPassword"),
            $("#loginPassword").val().length > 0,
            "loginPasswordFeedback"
        );

        if (isEmailValid && isPasswordValid) {
            showToast("Login Successful!");

            $("#loginModal").modal("hide");

            $("#loginEmail, #loginPassword")
                .val("")
                .removeClass("is-valid is-invalid");
        } else {
            showToast("Invalid credentials format.", "error");
        }
    });

    $("#regName").on("input focusout", function () {
        validateInput(
            $(this),
            validateName($(this).val()),
            "regNameFeedback"
        );
    });

    $("#regEmail").on("input focusout", function () {
        validateInput(
            $(this),
            validateEmail($(this).val()),
            "regEmailFeedback"
        );
    });

    $("#regPassword").on("focus", function () {
        $("#passwordStrengthContainer").slideDown(200);
    });

    $("#regPassword").on("input", function () {
        let password = $(this).val();

        let checks = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        let passedCount = 0;

        function updateRule(elementId, isValid) {
            let el = $("#" + elementId);

            if (isValid) {
                el.removeClass("rule-invalid").addClass("rule-valid");

                el.find("i")
                    .removeClass("bi-circle-fill")
                    .addClass("bi-check-circle-fill");

                passedCount++;
            } else {
                el.removeClass("rule-valid").addClass("rule-invalid");

                el.find("i")
                    .removeClass("bi-check-circle-fill")
                    .addClass("bi-circle-fill");
            }
        }

        updateRule("ruleLength", checks.length);
        updateRule("ruleUpper", checks.upper);
        updateRule("ruleLower", checks.lower);
        updateRule("ruleNumber", checks.number);
        updateRule("ruleSpecial", checks.special);

        let progress = (passedCount / 5) * 100;

        let progressEl = $("#passwordStrengthProgress");

        progressEl.css("width", progress + "%");

        if (progress <= 40) {
            progressEl.css("background-color", "#e22020");
        } else if (progress <= 80) {
            progressEl.css("background-color", "#ffb300");
        } else {
            progressEl.css("background-color", "#20bf6b");
        }
    });

    $("#regPassword").on("focusout", function () {
        let password = $(this).val();

        let isValid =
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[!@#$%^&*(),.?":{}|<>]/.test(password);

        validateInput(
            $(this),
            isValid,
            "regPasswordFeedback"
        );
    });

    $("#regConfirmPassword").on("input focusout", function () {
        let match =
            $(this).val() === $("#regPassword").val() &&
            $(this).val().length > 0;

        validateInput(
            $(this),
            match,
            "regConfirmPasswordFeedback"
        );
    });

    
$("#createAccountBtn").click(async function (e) {
    e.preventDefault();

    let isNameValid = validateInput(
        $("#regName"),
        validateName($("#regName").val()),
        "regNameFeedback"
    );

    let isEmailValid = validateInput(
        $("#regEmail"),
        validateEmail($("#regEmail").val()),
        "regEmailFeedback"
    );

    let password = $("#regPassword").val();

    let isPasswordStrong =
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let isPasswordValid = validateInput(
        $("#regPassword"),
        isPasswordStrong,
        "regPasswordFeedback"
    );

    let isConfirmValid = validateInput(
        $("#regConfirmPassword"),
        $("#regConfirmPassword").val() === password &&
            password.length > 0,
        "regConfirmPasswordFeedback"
    );

    if (
        !isNameValid ||
        !isEmailValid ||
        !isPasswordValid ||
        !isConfirmValid
    ) {
        showToast(
            "Please meet all account registration requirements.",
            "error"
        );
        return;
    }

    const button = $("#createAccountBtn");
    button.prop("disabled", true);

    try {
        const csrfResponse = await fetch(
            "http://localhost:8080/api/auth/csrf",
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (!csrfResponse.ok) {
            throw new Error("Unable to initialize secure registration.");
        }

        const csrfData = await csrfResponse.json();

        const response = await fetch(
            "http://localhost:8080/api/auth/register",
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfData.token
                },
                body: JSON.stringify({
                    name: $("#regName").val().trim(),
                    email: $("#regEmail").val().trim(),
                    password: password
                })
            }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 409) {
                throw new Error(
                    "This email is already registered. Please log in."
                );
            }

            throw new Error(
                result.message ||
                result.error ||
                "Registration failed. Please try again."
            );
        }

        showToast("Account Created Successfully!");

        $("#registerModal").modal("hide");

        $("#regName, #regEmail, #regPassword, #regConfirmPassword")
            .val("")
            .removeClass("is-valid is-invalid");

        $("#passwordStrengthProgress").css("width", "0%");
        $("#passwordStrengthContainer").slideUp(200);

        $(".password-rule-item")
            .removeClass("rule-valid")
            .addClass("rule-invalid");

    } catch (error) {
        console.error("FoodExpress registration error:", error);
        showToast(error.message || "Unable to register.", "error");
    } finally {
        button.prop("disabled", false);
    }
});

    // Add to Cart: delegated event supports dynamically loaded menu cards.
    $(document).on("click", ".add-cart", function (e) {
        e.preventDefault();

        const button = $(this);

        const foodId = Number(button.attr("data-id"));
        const name = String(button.attr("data-name") || "").trim();
        const price = Number(button.attr("data-price"));

        if (
            !Number.isInteger(foodId) ||
            foodId <= 0 ||
            !name ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            showToast("Invalid food item. Please refresh the menu.", "error");
            console.error("Invalid food item:", {
                foodId: foodId,
                name: name,
                price: price
            });
            return;
        }

        let cart = getCart();

        const existingItem = cart.find(function (item) {
            return Number(item.foodId) === foodId;
        });

        if (existingItem) {
            existingItem.quantity = Number(existingItem.quantity || 1) + 1;
        } else {
            cart.push({
                foodId: foodId,
                name: name,
                price: price,
                quantity: 1
            });
        }

        saveCart(cart);
        renderCart();

        showToast(name + " added to cart!");

        const cartBtn = $("#cartBtn");

        if (cartBtn.length) {
            cartBtn.addClass("cart-bounce");

            setTimeout(function () {
                cartBtn.removeClass("cart-bounce");
            }, 600);
        }
    });

    // Increase cart item quantity.
    $(document).on("click", ".increaseCartQty", function () {
        const index = Number($(this).attr("data-index"));
        let cart = getCart();

        if (!Number.isInteger(index) || !cart[index]) {
            return;
        }

        cart[index].quantity = Number(cart[index].quantity || 1) + 1;

        saveCart(cart);
        renderCart();
    });

    // Decrease cart item quantity.
    $(document).on("click", ".decreaseCartQty", function () {
        const index = Number($(this).attr("data-index"));
        let cart = getCart();

        if (!Number.isInteger(index) || !cart[index]) {
            return;
        }

        const quantity = Number(cart[index].quantity || 1);

        if (quantity > 1) {
            cart[index].quantity = quantity - 1;

            saveCart(cart);
            renderCart();
        }
    });

    // Remove item from cart.
    $(document).on("click", ".removeItem", function () {
        const index = Number($(this).attr("data-index"));
        let cart = getCart();

        if (!Number.isInteger(index) || !cart[index]) {
            return;
        }

        cart.splice(index, 1);

        saveCart(cart);
        renderCart();

        showToast("Item removed from cart", "error");
    });

    // Load cart count and display cart contents.
    let cart = getCart();

    updateCartCount(cart);
    renderCart();

    $(window).scroll(function () {
        if ($(this).scrollTop() > 200) {
            $("#topBtn").fadeIn();
        } else {
            $("#topBtn").fadeOut();
        }
    });

    $("#topBtn").click(function () {
        $("html, body").animate({ scrollTop: 0 }, 600);
    });

    $(".counter").each(function () {
        let $this = $(this);
        let target = parseInt($this.attr("data-target"));

        $({ countNum: 0 }).animate(
            { countNum: target },
            {
                duration: 2000,
                easing: "swing",

                step: function () {
                    $this.text(Math.floor(this.countNum));
                },

                complete: function () {
                    if (target === 48) {
                        $this.text("4.8★");
                    } else {
                        $this.text(target + "+");
                    }
                }
            }
        );
    });

    $("#applyCoupon").click(function () {
        let code = $("#couponCode").val().trim();
        let total = Number($("#grandTotal").text()) || 0;

        if (code === "SAVE50") {
            if (total > 50) {
                total = total - 50;

                $("#grandTotal").text(total.toFixed(2));

                showToast("Coupon SAVE50 applied! ₹50 discount added.");

                $("#couponCode").val("").prop("disabled", true);

                $(this).prop("disabled", true);
            } else {
                showToast(
                    "Cart total must be greater than ₹50 to apply coupon.",
                    "error"
                );
            }
        } else {
            showToast("Invalid Coupon Code", "error");
        }
    });

});
