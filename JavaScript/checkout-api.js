
$(document).ready(function () {

    $("#checkoutForm").on("submit", async function (event) {
        event.preventDefault();

        const form = $(this);

        const submitButton = form.find(
            'button[type="submit"], input[type="submit"]'
        );

        if (submitButton.prop("disabled")) {
            return;
        }

        function setButtonText(text) {
            submitButton.each(function () {
                const button = $(this);

                if (button.is("input")) {
                    button.val(text);
                } else {
                    button.text(text);
                }
            });
        }

        let cart = [];

        try {
            cart = JSON.parse(localStorage.getItem("cart") || "[]");
        } catch (error) {
            alert("Your cart data is invalid. Please add your items again.");
            return;
        }

        if (!Array.isArray(cart) || cart.length === 0) {
            alert("Your cart is empty. Please add items before placing an order.");
            return;
        }

        const customerName = $("#name").val().trim();
        const mobile = $("#mobile").val().trim();
        const email = $("#email").val().trim();
        const address = $("#address").val().trim();

        if (!customerName || !mobile || !email || !address) {
            alert("Please fill in all customer details.");
            return;
        }

        if (!/^[a-zA-Z\s]{3,}$/.test(customerName)) {
            alert("Please enter a valid full name.");
            return;
        }

        if (!/^[0-9]{10}$/.test(mobile)) {
            alert("Please enter a valid 10-digit mobile number.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (address.length < 5) {
            alert("Please enter a valid delivery address.");
            return;
        }

        const orderItems = cart.map(function (item) {
            return {
                foodId: Number(item.foodId || item.id),
                quantity: Number(item.quantity || 1)
            };
        });

        const invalidItem = orderItems.some(function (item) {
            return !Number.isInteger(item.foodId) ||
                item.foodId <= 0 ||
                !Number.isInteger(item.quantity) ||
                item.quantity < 1 ||
                item.quantity > 50;
        });

        if (invalidItem) {
            alert(
                "Your cart contains invalid food items. " +
                "Please remove them and add the items again."
            );
            return;
        }

        const orderData = {
            customerName: customerName,
            mobile: mobile,
            email: email,
            address: address,
            items: orderItems
        };

        submitButton.prop("disabled", true);
        setButtonText("Placing Order...");

        try {

            const csrfResponse = await fetch(
                "http://127.0.0.1:8080/api/auth/csrf",
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            if (!csrfResponse.ok) {
                throw new Error(
                    "Unable to connect to the security service."
                );
            }

            const csrfData = await csrfResponse.json();

            if (!csrfData.token) {
                throw new Error(
                    "Security token was not received from the backend."
                );
            }

            const orderResponse = await fetch(
                "http://127.0.0.1:8080/api/orders",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-XSRF-TOKEN": csrfData.token
                    },
                    body: JSON.stringify(orderData)
                }
            );

            const responseText = await orderResponse.text();

            let result = {};

            try {
                result = responseText ? JSON.parse(responseText) : {};
            } catch (error) {
                throw new Error(
                    "Backend returned an invalid response. Check the Spring Boot server."
                );
            }

            if (!orderResponse.ok) {
                throw new Error(
                    result.message ||
                    result.error ||
                    result.detail ||
                    "Unable to place your order."
                );
            }

            if (
                result.orderId === undefined ||
                result.orderId === null
            ) {
                throw new Error(
                    "Order response is missing the order ID. " +
                    "Please check your backend order response."
                );
            }

            localStorage.removeItem("cart");

            $("#cartCount").text("0");

            alert(
                "Order placed successfully!\n\n" +
                "Order ID: " + result.orderId + "\n" +
                "Status: " + (result.status || "PLACED") + "\n" +
                "Total: ₹" +
                Number(result.totalAmount || 0).toFixed(2)
            );

            window.location.href = "index.html";

        } catch (error) {

            console.error("Checkout error:", error);

            alert(
                error.message ||
                "Unable to place your order. Please try again."
            );

        } finally {

            submitButton.prop("disabled", false);
            setButtonText("Place Order");

        }

    });

});
