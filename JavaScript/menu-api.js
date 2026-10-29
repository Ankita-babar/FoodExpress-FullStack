
$(document).ready(function () {

    const API_URL = "http://localhost:8080/api/foods";

    const foodImages = {
        pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
        burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
        biryani: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800"
    };

    function getFoodImage(name) {
        const foodName = String(name || "").toLowerCase();

        for (const key in foodImages) {
            if (foodName.includes(key)) {
                return foodImages[key];
            }
        }

        return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
    }

    function getCart() {
        try {
            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            return Array.isArray(cart) ? cart : [];
        } catch (error) {
            console.error("Cart loading error:", error);
            return [];
        }
    }

    function updateCartCount() {
        const cart = getCart();

        const count = cart.reduce(function (total, item) {
            return total + Number(item.quantity || 1);
        }, 0);

        $("#cartCount").text(count);
    }

    function addFoodToCart(food) {

        let cart = getCart();

        const foodId = Number(food.id);
        const foodName = String(food.name);
        const foodPrice = Number(food.price);

        if (
            !Number.isInteger(foodId) ||
            foodId <= 0 ||
            !foodName ||
            !Number.isFinite(foodPrice) ||
            foodPrice < 0
        ) {
            alert("Invalid food item. Please refresh the menu.");
            return;
        }

        const existingItem = cart.find(function (item) {
            return Number(item.foodId || item.id) === foodId;
        });

        if (existingItem) {

            const currentQuantity = Number(existingItem.quantity || 1);

            if (currentQuantity >= 50) {
                alert("Maximum quantity is 50 for one food item.");
                return;
            }

            existingItem.foodId = foodId;
            existingItem.name = foodName;
            existingItem.price = foodPrice;
            existingItem.quantity = currentQuantity + 1;

        } else {

            cart.push({
                foodId: foodId,
                name: foodName,
                price: foodPrice,
                quantity: 1
            });

        }

        localStorage.setItem("cart", JSON.stringify(cart));

        updateCartCount();

        if (typeof showToast === "function") {
            showToast(foodName + " added to cart!");
        } else {
            alert(foodName + " added to cart!");
        }

        const cartButton = $("#cartBtn");

        if (cartButton.length) {
            cartButton.addClass("cart-bounce");

            setTimeout(function () {
                cartButton.removeClass("cart-bounce");
            }, 600);
        }
    }

    function loadFoods() {

        $.ajax({
            url: API_URL,
            method: "GET",
            dataType: "json",

            success: function (foods) {

                const foodList = $("#foodList");

                foodList.empty();

                if (!Array.isArray(foods) || foods.length === 0) {

                    foodList.html(
                        '<div class="col-12 text-center">' +
                        '<h4>No food items available.</h4>' +
                        '</div>'
                    );

                    return;
                }

                foods.forEach(function (food) {

                    const column = $("<div>")
                        .addClass("col-md-4 mb-4");

                    const card = $("<div>")
                        .addClass("card restaurant-card h-100");

                    const image = $("<img>")
                        .addClass("card-img-top")
                        .attr("src", getFoodImage(food.name))
                        .attr("alt", food.name);

                    const body = $("<div>")
                        .addClass("card-body");

                    const name = $("<h5>")
                        .addClass("card-title")
                        .text(food.name);

                    const price = $("<p>")
                        .addClass("fs-5 fw-bold text-orange")
                        .text("₹" + Number(food.price).toFixed(2));

                    const button = $("<button>")
                        .addClass("btn btn-main add-cart w-100")
                        .attr("data-id", food.id)
                        .attr("data-name", food.name)
                        .attr("data-price", food.price)
                        .text("Add To Cart");

                    body.append(name, price, button);

                    card.append(image, body);

                    column.append(card);

                    foodList.append(column);

                });

            },

            error: function (xhr) {

                console.error("Food API error:", xhr.status, xhr.responseText);

                $("#foodList").html(
                    '<div class="col-12 text-center">' +
                    '<h4>Unable to load menu.</h4>' +
                    '<p>Please make sure the backend is running.</p>' +
                    '</div>'
                );

            }
        });

    }
    
    updateCartCount();

    loadFoods();

});
