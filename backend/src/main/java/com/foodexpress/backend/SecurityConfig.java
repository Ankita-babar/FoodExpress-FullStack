package com.foodexpress.backend;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            UserDetailsService userDetailsService,
            Environment environment) throws Exception {

        String adminUsername =
                environment.getProperty("FOODEXPRESS_ADMIN_USERNAME");
        String adminPassword =
                environment.getProperty("FOODEXPRESS_ADMIN_PASSWORD");

        if (adminUsername == null || adminUsername.isBlank()
                || adminPassword == null || adminPassword.length() < 12) {
            throw new IllegalStateException(
                    "Set FOODEXPRESS_ADMIN_USERNAME and "
                    + "FOODEXPRESS_ADMIN_PASSWORD. Password must be at least 12 characters.");
        }

        CookieCsrfTokenRepository repository =
                CookieCsrfTokenRepository.withHttpOnlyFalse();

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf
                .csrfTokenRepository(repository)
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
    .requestMatchers("/api/auth/csrf", "/api/auth/register").permitAll()
    .requestMatchers("/api/orders").permitAll()
    .requestMatchers("/api/foods/admin").hasRole("ADMIN")
    .requestMatchers("/api/foods/**").permitAll()
    .requestMatchers("/api/orders/**").permitAll()
    .requestMatchers(HttpMethod.POST, "/api/foods").hasRole("ADMIN")
    .requestMatchers(HttpMethod.PUT, "/api/foods/**").hasRole("ADMIN")
    .requestMatchers(HttpMethod.DELETE, "/api/foods/**").hasRole("ADMIN")
    .requestMatchers("/login", "/logout").permitAll()
    .anyRequest().authenticated()
)
               
            .formLogin(form -> form
                .permitAll()
                .successHandler((request, response, authentication) ->
                    response.setStatus(HttpServletResponse.SC_NO_CONTENT))
                .failureHandler((request, response, exception) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType("application/json");
                    response.getWriter().write(
                        "{\"message\":\"Invalid email or password.\"}");
                })
            )
            .logout(logout -> logout
                .logoutSuccessHandler((request, response, authentication) ->
                    response.setStatus(HttpServletResponse.SC_NO_CONTENT))
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "http://localhost:5500",
                "http://127.0.0.1:5500"
        ));

        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        configuration.setAllowedHeaders(
                List.of("Content-Type", "X-XSRF-TOKEN"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}