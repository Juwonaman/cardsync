package com.olajuwon.cardaggregator.service;

import com.olajuwon.cardaggregator.dto.AuthResponse;
import com.olajuwon.cardaggregator.dto.RegisterRequest;
import com.olajuwon.cardaggregator.model.User;
import com.olajuwon.cardaggregator.repository.UserRepository;
import com.olajuwon.cardaggregator.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_successfullyCreatesUser() {
        RegisterRequest request = new RegisterRequest();
        request.setName("John");
        request.setEmail("john@test.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail("john@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(jwtUtil.generateToken("john@test.com")).thenReturn("fake-jwt-token");

        AuthResponse response = authService.register(request);

        assertEquals("john@test.com", response.getEmail());
        assertEquals("John", response.getName());
        assertEquals("fake-jwt-token", response.getToken());
    }

    @Test
    void register_throwsException_whenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("john@test.com");

        when(userRepository.existsByEmail("john@test.com")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> authService.register(request));
    }

    @Test
    void login_successfullyReturnsToken() {
        User user = new User();
        user.setEmail("john@test.com");
        user.setName("John");
        user.setPassword("hashedPassword");

        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);
        when(jwtUtil.generateToken("john@test.com")).thenReturn("fake-jwt-token");

        AuthResponse response = authService.login("john@test.com", "password123");

        assertEquals("fake-jwt-token", response.getToken());
        assertEquals("john@test.com", response.getEmail());
    }

    @Test
    void login_throwsException_whenUserNotFound() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                authService.login("unknown@test.com", "password123"));
    }

    @Test
    void login_throwsException_whenPasswordIsWrong() {
        User user = new User();
        user.setEmail("john@test.com");
        user.setPassword("hashedPassword");

        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "hashedPassword")).thenReturn(false);

        assertThrows(RuntimeException.class, () ->
                authService.login("john@test.com", "wrongpassword"));
    }
}
