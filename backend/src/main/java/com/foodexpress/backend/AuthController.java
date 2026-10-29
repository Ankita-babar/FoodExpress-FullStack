package com.foodexpress.backend;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/csrf")
    public Map<String, String> getCsrfToken(CsrfToken csrfToken) {
        return Map.of("token", csrfToken.getToken());
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @RequestBody RegistrationRequest request) {

        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Name is required."));
        }

        if (request.getEmail() == null
                || !request.getEmail().trim().matches(
                        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Enter a valid email address."));
        }

        if (request.getPassword() == null
                || request.getPassword().length() < 8
                || !request.getPassword().matches(".*[A-Z].*")
                || !request.getPassword().matches(".*[a-z].*")
                || !request.getPassword().matches(".*[0-9].*")
                || !request.getPassword().matches(".*[!@#$%^&*(),.?\":{}|<>].*")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Password must contain at least 8 characters, uppercase and lowercase letters, a number, and a special character."));
        }

        String email = request.getEmail().trim().toLowerCase();

        if (customerRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message",
                            "An account with this email already exists."));
        }

        Customer customer = new Customer();
        customer.setName(request.getName().trim());
        customer.setEmail(email);
        customer.setPassword(passwordEncoder.encode(request.getPassword()));

        customerRepository.save(customer);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message",
                        "Account created successfully. You can now log in."));
    }

    public static class RegistrationRequest {

        private String name;
        private String email;
        private String password;

        public RegistrationRequest() {
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}