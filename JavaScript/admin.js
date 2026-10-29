
const API_URL = "http://localhost:8080/api/foods";
const AUTH_URL = "http://localhost:8080/api/auth/csrf";

const foodForm = document.getElementById("foodForm");
const foodTable = document.getElementById("foodTable");
const messageBox = document.getElementById("message");

let foods = [];

function showMessage(message, type = "success") {
    messageBox.textContent = message;
    messageBox.className = `alert alert-${type}`;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

async function getCsrfToken() {
    const response = await fetch(AUTH_URL, {
        method: "GET",
        credentials: "include",
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(`Could not get security token: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.token;
}

async function apiRequest(url, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    const headers = new Headers(options.headers || {});

    if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
        headers.set("X-XSRF-TOKEN", await getCsrfToken());
    }

    const response = await fetch(url, {
        ...options,
        method,
        headers,
        credentials: "include"
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            throw new Error(
                "Access denied. Please sign in again using the admin login page."
            );
        }

        const details = await response.text();
        throw new Error(details || `Server returned HTTP ${response.status}`);
    }

    return response;
}


async function loadFoods() {
    foodTable.innerHTML =
        '<tr><td colspan="6" class="text-center">Loading...</td></tr>';

    try {
        const response = await apiRequest(`${API_URL}/admin`);

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
            const responseText = await response.text();

            console.error("Unexpected food API response:", {
                status: response.status,
                url: response.url,
                redirected: response.redirected,
                contentType,
                responsePreview: responseText.slice(0, 300)
            });

            throw new Error(
                `Expected JSON but received HTML or another response. HTTP ${response.status}. Check the browser Console.`
            );
        }

        foods = await response.json();
        renderFoods();

        messageBox.textContent = "";
        messageBox.className = "alert d-none";
    } catch (error) {
        console.error("FoodExpress load foods error:", error);

        foodTable.innerHTML =
            `<tr><td colspan="6" class="text-danger">${escapeHTML(error.message)}</td></tr>`;

        showMessage("Unable to load food items. " + error.message, "danger");
    }
}

function renderFoods() {
    if (foods.length === 0) {
        foodTable.innerHTML =
            '<tr><td colspan="6" class="text-center">No food items found.</td></tr>';
        return;
    }

    foodTable.innerHTML = foods.map(food => `
        <tr>
            <td>${escapeHTML(food.id)}</td>
            <td>${escapeHTML(food.name)}</td>
            <td>${escapeHTML(food.category)}</td>
            <td>₹${Number(food.price).toFixed(2)}</td>
            <td class="${food.available ? "status-available" : "status-unavailable"}">
                ${food.available ? "Available" : "Unavailable"}
            </td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-warning"
                            data-action="edit"
                            data-id="${escapeHTML(food.id)}">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-outline-primary"
                            data-action="toggle"
                            data-id="${escapeHTML(food.id)}">
                        ${food.available ? "Disable" : "Enable"}
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

foodForm.addEventListener("submit", async event => {
    event.preventDefault();

    const id = document.getElementById("foodId").value;
    const price = Number(document.getElementById("price").value);

    if (!Number.isFinite(price) || price <= 0) {
        showMessage("Enter a price greater than zero.", "warning");
        return;
    }

    const food = {
        name: document.getElementById("name").value.trim(),
        category: document.getElementById("category").value.trim(),
        price,
        description: document.getElementById("description").value.trim(),
        available: document.getElementById("available").checked
    };

    if (!food.name || !food.category) {
        showMessage("Food name and category are required.", "warning");
        return;
    }

    const saveButton = document.getElementById("saveButton");
    saveButton.disabled = true;

    try {
        await apiRequest(
            id ? `${API_URL}/${id}` : API_URL,
            {
                method: id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(food)
            }
        );

        resetForm();
        showMessage(
            id ? "Food item updated successfully." : "Food item added successfully."
        );
        await loadFoods();
    } catch (error) {
        console.error("FoodExpress save food error:", error);
        showMessage("Could not save food item. " + error.message, "danger");
    } finally {
        saveButton.disabled = false;
    }
});

foodTable.addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = Number(button.dataset.id);
    const food = foods.find(item => Number(item.id) === id);
    if (!food) return;

    if (button.dataset.action === "edit") {
        document.getElementById("foodId").value = food.id;
        document.getElementById("name").value = food.name ?? "";
        document.getElementById("category").value = food.category ?? "";
        document.getElementById("price").value = food.price;
        document.getElementById("description").value = food.description ?? "";
        document.getElementById("available").checked = food.available;

        document.getElementById("formTitle").textContent = "Edit Food Item";
        document.getElementById("saveButton").textContent = "Save Changes";
        document.getElementById("cancelButton").classList.remove("d-none");
        document.getElementById("name").focus();
        return;
    }

    if (button.dataset.action === "toggle") {
        const updatedFood = {
            name: food.name,
            category: food.category,
            price: food.price,
            description: food.description ?? "",
            available: !food.available
        };

        button.disabled = true;

        try {
            await apiRequest(`${API_URL}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedFood)
            });

            showMessage(
                `Food item marked ${updatedFood.available ? "available" : "unavailable"}.`
            );

            await loadFoods();
        } catch (error) {
            console.error("FoodExpress update food error:", error);
            showMessage("Could not update food availability. " + error.message, "danger");
        } finally {
            button.disabled = false;
        }
    }
});

function resetForm() {
    foodForm.reset();
    document.getElementById("foodId").value = "";
    document.getElementById("available").checked = true;
    document.getElementById("formTitle").textContent = "Add Food Item";
    document.getElementById("saveButton").textContent = "Add Food";
    document.getElementById("cancelButton").classList.add("d-none");
}

document.getElementById("cancelButton").addEventListener("click", resetForm);
document.getElementById("refreshButton").addEventListener("click", loadFoods);

loadFoods();
