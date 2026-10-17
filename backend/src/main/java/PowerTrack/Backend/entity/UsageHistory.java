package PowerTrack.Backend.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class UsageHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    private LocalDateTime recordedAt;

    private double dailyUsage;

    private double estimatedBill;

    private Long userId;

    @Column(columnDefinition = "TEXT")
    private String applianceDetails;


    public UsageHistory() {
    }


    public Long getId() {
        return id;
    }


    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }


    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(
            LocalDateTime recordedAt) {

        this.recordedAt = recordedAt;
    }


    public double getDailyUsage() {
        return dailyUsage;
    }

    public void setDailyUsage(
            double dailyUsage) {

        this.dailyUsage = dailyUsage;
    }


    public double getEstimatedBill() {
        return estimatedBill;
    }

    public void setEstimatedBill(
            double estimatedBill) {

        this.estimatedBill = estimatedBill;
    }


    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }


    public String getApplianceDetails() {
        return applianceDetails;
    }

    public void setApplianceDetails(
            String applianceDetails) {

        this.applianceDetails =
                applianceDetails;
    }
}