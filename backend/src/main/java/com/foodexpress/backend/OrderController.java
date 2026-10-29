
package com.foodexpress.backend;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
@Validated
public class OrderController {

    private final OrderRepository orderRepository;
    private final FoodRepository foodRepository;

    public OrderController(
            OrderRepository orderRepository,
            FoodRepository foodRepository) {

        this.orderRepository = orderRepository;
        this.foodRepository = foodRepository;
    }

    @GetMapping
    public ResponseEntity<?> getOrders(@RequestParam String email) {
        System.out.println("MY ORDERS API CALLED");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Email is required.");
        }

        List<CustomerOrder> orders =
                orderRepository.findByEmailIgnoreCaseOrderByOrderDateDesc(
                        email.trim());

        List<OrderHistoryResponse> response = orders.stream()
                .map(order -> new OrderHistoryResponse(
                        order.getId(),
                        order.getOrderDate(),
                        order.getStatus(),
                        order.getTotalAmount(),
                        order.getItems().stream()
                                .map(item -> new OrderItemResponse(
                                        item.getFoodName(),
                                        item.getQuantity(),
                                        item.getPrice()))
                                .toList()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> placeOrder(@Valid @RequestBody OrderRequest request) {

        List<OrderRequest.OrderLineRequest> requestedItems =
                request.getItems();

        if (requestedItems == null || requestedItems.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Your cart is empty.");
        }

        CustomerOrder order = new CustomerOrder();

        order.setCustomerName(request.getCustomerName().trim());
        order.setMobile(request.getMobile().trim());
        order.setEmail(request.getEmail().trim());
        order.setAddress(request.getAddress().trim());

        BigDecimal total = BigDecimal.ZERO;

        for (OrderRequest.OrderLineRequest line : requestedItems) {

            Food food = foodRepository.findById(line.getFoodId())
                    .orElse(null);

            if (food == null || !food.isAvailable()) {
                return ResponseEntity.badRequest()
                        .body("A selected food item is unavailable.");
            }

            BigDecimal itemTotal = food.getPrice()
                    .multiply(BigDecimal.valueOf(line.getQuantity()));

            total = total.add(itemTotal);

            OrderItem item = new OrderItem(
                    food.getId(),
                    food.getName(),
                    line.getQuantity(),
                    food.getPrice()
            );

            order.addItem(item);
        }

        order.setTotalAmount(total);

        CustomerOrder savedOrder = orderRepository.save(order);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new OrderResponse(
                        savedOrder.getId(),
                        savedOrder.getStatus(),
                        savedOrder.getTotalAmount(),
                        "Order placed successfully!"
                )
        );
    }

    public record OrderResponse(
            Long orderId,
            String status,
            BigDecimal totalAmount,
            String message
    ) {
    }

    public record OrderHistoryResponse(
            Long orderId,
            LocalDateTime orderDate,
            String status,
            BigDecimal totalAmount,
            List<OrderItemResponse> items
    ) {
    }

    public record OrderItemResponse(
            String foodName,
            Integer quantity,
            BigDecimal price
    ) {
    }
}
