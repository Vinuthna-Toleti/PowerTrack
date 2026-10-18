
package PowerTrack.Backend.controller;

import PowerTrack.Backend.entity.User;
import PowerTrack.Backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://powertrack-ashy.vercel.app"
    },
    allowedHeaders = "*",
    methods = {
        org.springframework.web.bind.annotation.RequestMethod.GET,
        org.springframework.web.bind.annotation.RequestMethod.POST,
        org.springframework.web.bind.annotation.RequestMethod.PUT,
        org.springframework.web.bind.annotation.RequestMethod.OPTIONS
    }
)
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        if (user.getName() == null || user.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Name is required");
        }

        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("Password is required");
        }

        String email = user.getEmail().trim();

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest()
                    .body("Email is already registered");
        }

        user.setName(user.getName().trim());
        user.setEmail(email);

        // Set a default tariff when the user registers
        if (user.getRatePerUnit() == null) {
            user.setRatePerUnit(0.0);
        }

        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(savedUser);
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginData) {

        if (loginData.getEmail() == null ||
                loginData.getPassword() == null) {
            return ResponseEntity.badRequest()
                    .body("Email and password are required");
        }

        Optional<User> optionalUser =
                userRepository.findByEmail(loginData.getEmail().trim());

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            if (user.getPassword().equals(loginData.getPassword())) {
                return ResponseEntity.ok(user);
            }
        }

        return ResponseEntity.badRequest()
                .body("Invalid email or password");
    }

    // UPDATE NAME AND EMAIL
    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long userId,
            @RequestBody Map<String, String> profileData) {

        Optional<User> optionalUser = userRepository.findById(userId);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String name = profileData.get("name");
        String email = profileData.get("email");

        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Name is required");
        }

        if (email == null || email.trim().isEmpty()
                || !email.trim().matches(
                "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest()
                    .body("Enter a valid email address");
        }

        name = name.trim();
        email = email.trim();

        Optional<User> userWithEmail =
                userRepository.findByEmail(email);

        if (userWithEmail.isPresent()
                && !userWithEmail.get().getId().equals(userId)) {
            return ResponseEntity.badRequest()
                    .body("This email is already registered");
        }

        User user = optionalUser.get();
        user.setName(name);
        user.setEmail(email);

        User updatedUser = userRepository.save(user);

        return ResponseEntity.ok(updatedUser);
    }

    // UPDATE ELECTRICITY TARIFF
    @PutMapping("/rate/{userId}")
    public ResponseEntity<?> updateRate(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> data) {

        Optional<User> optionalUser = userRepository.findById(userId);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Object value = data.get("ratePerUnit");

            if (value == null) {
                return ResponseEntity.badRequest()
                        .body("Rate per unit is required");
            }

            double rate = Double.parseDouble(value.toString());

            if (!Double.isFinite(rate) || rate < 0) {
                return ResponseEntity.badRequest()
                        .body("Rate must be a valid non-negative number");
            }

            User user = optionalUser.get();
            user.setRatePerUnit(rate);

            User updatedUser = userRepository.save(user);

            return ResponseEntity.ok(updatedUser);

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body("Invalid electricity rate");
        }
    }

    // UPDATE MONTHLY BUDGET
    @PutMapping("/budget/{userId}")
    public ResponseEntity<?> updateBudget(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> data) {

        Optional<User> optionalUser = userRepository.findById(userId);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Object value = data.get("monthlyBudget");

            if (value == null) {
                return ResponseEntity.badRequest()
                        .body("Monthly budget is required");
            }

            double budget = Double.parseDouble(value.toString());

            if (!Double.isFinite(budget) || budget < 0) {
                return ResponseEntity.badRequest()
                        .body("Budget must be a valid non-negative number");
            }

            User user = optionalUser.get();
            user.setMonthlyBudget(budget);

            User updatedUser = userRepository.save(user);

            return ResponseEntity.ok(updatedUser);

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body("Invalid monthly budget");
        }
    }

    // GET USER PROFILE
    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable Long userId) {

        Optional<User> optionalUser = userRepository.findById(userId);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(optionalUser.get());
    }

    // FORGOT PASSWORD - INITIAL ENDPOINT TEST
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email is required"));
        }

        Optional<User> optionalUser =
                userRepository.findByEmail(email.trim());

        // Use the same response whether the email exists or not.
        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "If the email is registered, follow the password reset instructions sent to it."
                )
        );
    }
}
