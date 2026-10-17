package PowerTrack.Backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import PowerTrack.Backend.entity.User;

public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndPassword(
            String email,
            String password
    );
}
