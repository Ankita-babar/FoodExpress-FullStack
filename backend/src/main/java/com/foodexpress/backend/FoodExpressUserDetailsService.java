package com.foodexpress.backend;

import org.springframework.core.env.Environment;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class FoodExpressUserDetailsService implements UserDetailsService {

    private final CustomerRepository customerRepository;
    private final Environment environment;
    private final PasswordEncoder passwordEncoder;

    public FoodExpressUserDetailsService(
            CustomerRepository customerRepository,
            Environment environment,
            PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.environment = environment;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        String adminUsername =
                environment.getProperty("FOODEXPRESS_ADMIN_USERNAME");
        String adminPassword =
                environment.getProperty("FOODEXPRESS_ADMIN_PASSWORD");

        if (adminUsername != null
                && adminPassword != null
                && username.trim().equalsIgnoreCase(adminUsername.trim())) {

            return User.withUsername(adminUsername)
                    .password(passwordEncoder.encode(adminPassword))
                    .roles("ADMIN")
                    .build();
        }

        Customer customer = customerRepository
                .findByEmailIgnoreCase(username.trim())
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Invalid email or password."));

        return User.withUsername(customer.getEmail())
                .password(customer.getPassword())
                .roles("CUSTOMER")
                .build();
    }
}
