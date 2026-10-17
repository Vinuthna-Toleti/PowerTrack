package PowerTrack.Backend.repository;

import PowerTrack.Backend.entity.UsageHistory;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UsageHistoryRepository
        extends JpaRepository<UsageHistory, Long> {

    List<UsageHistory> findByUserId(Long userId);

    Optional<UsageHistory> findByUserIdAndDate(
            Long userId,
            LocalDate date
    );
}