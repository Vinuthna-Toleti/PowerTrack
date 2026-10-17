package PowerTrack.Backend.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import PowerTrack.Backend.entity.UsageHistory;
import PowerTrack.Backend.repository.UsageHistoryRepository;

@RestController
@RequestMapping("/api/usage-history")
@CrossOrigin(
        origins = "http://localhost:5173",
        methods = {
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.PUT,
                RequestMethod.DELETE,
                RequestMethod.OPTIONS
        }
)
public class UsageHistoryController {

    private final UsageHistoryRepository usageHistoryRepository;

    public UsageHistoryController(
            UsageHistoryRepository usageHistoryRepository) {

        this.usageHistoryRepository =
                usageHistoryRepository;
    }


    @GetMapping("/user/{userId}")
    public List<UsageHistory> getUserHistory(
            @PathVariable Long userId) {

        return usageHistoryRepository
                .findByUserId(userId);
    }


    /* =========================
       ENERGY PREDICTION
    ========================= */

    @GetMapping("/prediction/{userId}")
    public Map<String, Object> getPrediction(
            @PathVariable Long userId) {

        List<UsageHistory> history =
                usageHistoryRepository
                        .findByUserId(userId);

        Map<String, Object> result =
                new HashMap<>();

        if (history.isEmpty()) {

            result.put(
                    "message",
                    "Not enough usage data for prediction."
            );

            result.put(
                    "predictedUsage",
                    0
            );

            result.put(
                    "predictedBill",
                    0
            );

            return result;
        }


        double totalUsage = 0;

        for (UsageHistory record : history) {

            totalUsage +=
                    record.getDailyUsage();
        }


        double averageDailyUsage =
                totalUsage / history.size();


        double predictedMonthlyUsage =
                averageDailyUsage * 30;


        double predictedBill =
                calculateBill(
                        predictedMonthlyUsage
                );


        result.put(
                "averageDailyUsage",
                round(averageDailyUsage)
        );

        result.put(
                "predictedUsage",
                round(predictedMonthlyUsage)
        );

        result.put(
                "predictedBill",
                round(predictedBill)
        );

        result.put(
                "daysAnalyzed",
                history.size()
        );

        result.put(
                "message",
                "Prediction based on your recorded electricity usage."
        );

        return result;
    }


    /* =========================
       BILL CALCULATION
    ========================= */

    private double calculateBill(
            double units) {

        if (units <= 0) {
            return 0;
        }

        if (units <= 30) {

            return units * 1.90;
        }

        if (units <= 75) {

            return
                    30 * 1.90 +
                    (units - 30) * 3.00;
        }

        if (units <= 125) {

            return
                    30 * 1.90 +
                    45 * 3.00 +
                    (units - 75) * 4.50;
        }

        if (units <= 225) {

            return
                    30 * 1.90 +
                    45 * 3.00 +
                    50 * 4.50 +
                    (units - 125) * 6.00;
        }

        if (units <= 400) {

            return
                    30 * 1.90 +
                    45 * 3.00 +
                    50 * 4.50 +
                    100 * 6.00 +
                    (units - 225) * 8.75;
        }

        return
                30 * 1.90 +
                45 * 3.00 +
                50 * 4.50 +
                100 * 6.00 +
                175 * 8.75 +
                (units - 400) * 9.75;
    }


    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }


    @PostMapping
    public UsageHistory addHistory(
            @RequestBody UsageHistory usageHistory) {

        Long userId =
                usageHistory.getUserId();

        LocalDate date =
                usageHistory.getDate();

        UsageHistory existingHistory =
                usageHistoryRepository
                        .findByUserIdAndDate(
                                userId,
                                date
                        )
                        .orElse(null);

        if (existingHistory != null) {

            existingHistory.setDailyUsage(
                    usageHistory.getDailyUsage()
            );

            existingHistory.setEstimatedBill(
                    usageHistory.getEstimatedBill()
            );

            existingHistory.setApplianceDetails(
                    usageHistory.getApplianceDetails()
            );

            existingHistory.setRecordedAt(
                    LocalDateTime.now()
            );

            return usageHistoryRepository.save(
                    existingHistory
            );
        }

        usageHistory.setRecordedAt(
                LocalDateTime.now()
        );

        return usageHistoryRepository.save(
                usageHistory
        );
    }


    @PutMapping("/{id}")
    public UsageHistory updateHistory(
            @PathVariable Long id,
            @RequestBody UsageHistory updatedHistory) {

        UsageHistory existingHistory =
                usageHistoryRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "History record not found"
                                )
                        );

        existingHistory.setDate(
                updatedHistory.getDate()
        );

        existingHistory.setDailyUsage(
                updatedHistory.getDailyUsage()
        );

        existingHistory.setEstimatedBill(
                updatedHistory.getEstimatedBill()
        );

        existingHistory.setApplianceDetails(
                updatedHistory.getApplianceDetails()
        );

        existingHistory.setRecordedAt(
                LocalDateTime.now()
        );

        return usageHistoryRepository.save(
                existingHistory
        );
    }


    @DeleteMapping("/{id}")
    public void deleteHistory(
            @PathVariable Long id) {

        usageHistoryRepository.deleteById(id);
    }
}