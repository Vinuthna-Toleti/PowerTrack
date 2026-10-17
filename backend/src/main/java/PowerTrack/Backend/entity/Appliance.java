package PowerTrack.Backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Appliance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private int quantity;

    private double power;

    // Average hours per unit
    private double hours;

    private double dailyUsage;

    private double monthlyUsage;

    private Long userId;

    // Stores individual unit hours as JSON text
    // Example: [5,8,3]
    @Column(columnDefinition = "TEXT")
    private String unitHours;

    public Appliance() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getPower() {
        return power;
    }

    public void setPower(double power) {
        this.power = power;
    }

    public double getHours() {
        return hours;
    }

    public void setHours(double hours) {
        this.hours = hours;
    }

    public double getDailyUsage() {
        return dailyUsage;
    }

    public void setDailyUsage(double dailyUsage) {
        this.dailyUsage = dailyUsage;
    }

    public double getMonthlyUsage() {
        return monthlyUsage;
    }

    public void setMonthlyUsage(double monthlyUsage) {
        this.monthlyUsage = monthlyUsage;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUnitHours() {
        return unitHours;
    }

    public void setUnitHours(String unitHours) {
        this.unitHours = unitHours;
    }
}