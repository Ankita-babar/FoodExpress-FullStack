
package com.foodexpress.backend;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class OrderRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 100)
    private String customerName;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must contain exactly 10 digits")
    private String mobile;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    private String email;

    @NotBlank(message = "Delivery address is required")
    @Size(max = 500)
    private String address;

    @Valid
    private List<OrderLineRequest> items;

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public List<OrderLineRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderLineRequest> items) {
        this.items = items;
    }

    public static class OrderLineRequest {

        @jakarta.validation.constraints.NotNull
        private Long foodId;

        @jakarta.validation.constraints.NotNull
        @jakarta.validation.constraints.Min(1)
        @jakarta.validation.constraints.Max(50)
        private Integer quantity;

        public Long getFoodId() {
            return foodId;
        }

        public void setFoodId(Long foodId) {
            this.foodId = foodId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}
