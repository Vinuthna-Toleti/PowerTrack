
package PowerTrack.Backend.controller;

import java.util.ArrayList;
import java.util.List;

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

import PowerTrack.Backend.GeminiService;
import PowerTrack.Backend.entity.Appliance;
import PowerTrack.Backend.repository.ApplianceRepository;

@RestController
@RequestMapping("/api/appliances")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://powertrack-ashy.vercel.app"
        },
        allowedHeaders = "*",
        methods = {
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.PUT,
                RequestMethod.DELETE,
                RequestMethod.OPTIONS
        }
)
public class ApplianceController {

    private final ApplianceRepository applianceRepository;
    private final GeminiService geminiService;

    public ApplianceController(
            ApplianceRepository applianceRepository,
            GeminiService geminiService) {

        this.applianceRepository = applianceRepository;
        this.geminiService = geminiService;
    }

    // Get all appliances belonging to a user
    @GetMapping("/user/{userId}")
    public List<Appliance> getUserAppliances(
            @PathVariable Long userId) {

        return applianceRepository.findByUserId(userId);
    }

    // Add a new appliance
    @PostMapping
    public Appliance addAppliance(
            @RequestBody Appliance appliance) {

        return applianceRepository.save(appliance);
    }

    // Update appliance usage
    @PutMapping("/{id}")
    public Appliance updateAppliance(
            @PathVariable Long id,
            @RequestBody Appliance applianceData) {

        Appliance appliance =
                applianceRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Appliance not found"
                                )
                        );

        // Save average hours per unit
        appliance.setHours(
                applianceData.getHours()
        );

        // Save individual hours for each unit
        appliance.setUnitHours(
                applianceData.getUnitHours()
        );

        // Save daily electricity consumption
        appliance.setDailyUsage(
                applianceData.getDailyUsage()
        );

        // Save estimated monthly electricity consumption
        appliance.setMonthlyUsage(
                applianceData.getMonthlyUsage()
        );

        return applianceRepository.save(appliance);
    }

    // Delete an appliance
    @DeleteMapping("/{id}")
    public void deleteAppliance(
            @PathVariable Long id) {

        applianceRepository.deleteById(id);
    }

    // Smart Energy Suggestions
    @GetMapping("/suggestions/{userId}")
    public List<String> getSuggestions(
            @PathVariable Long userId) {

        List<Appliance> appliances =
                applianceRepository.findByUserId(userId);

        List<String> suggestions =
                new ArrayList<>();

        if (appliances.isEmpty()) {

            suggestions.add(
                    "Add appliances and usage data to get energy-saving suggestions."
            );

            return suggestions;
        }

        Appliance highestConsumer =
                appliances.get(0);

        double totalUsage = 0;

        for (Appliance appliance : appliances) {

            totalUsage += appliance.getDailyUsage();

            if (appliance.getDailyUsage()
                    > highestConsumer.getDailyUsage()) {

                highestConsumer = appliance;
            }
        }

        suggestions.add(
                highestConsumer.getName()
                + " is currently your highest energy-consuming appliance."
        );

        if (highestConsumer.getHours() > 6) {

            suggestions.add(
                    "Consider reducing "
                    + highestConsumer.getName()
                    + " usage time."
            );
        }

        if (totalUsage > 10) {

            suggestions.add(
                    "Your daily electricity usage is high. "
                    + "Try reducing unnecessary appliance usage."
            );

        } else if (totalUsage > 5) {

            suggestions.add(
                    "Your daily electricity usage is moderate. "
                    + "Reducing usage during unnecessary hours can save energy."
            );

        } else {

            suggestions.add(
                    "Your daily electricity usage is currently low."
            );
        }

        return suggestions;
    }

    // Gemini AI Energy Insights
    @GetMapping("/ai-insights/{userId}")
    public List<String> getAIInsights(
            @PathVariable Long userId) {

        List<Appliance> appliances =
                applianceRepository.findByUserId(userId);

        List<String> insights =
                new ArrayList<>();

        if (appliances.isEmpty()) {

            insights.add(
                    "Add appliances and usage data to generate personalized energy insights."
            );

            return insights;
        }

        StringBuilder prompt =
                new StringBuilder();

        prompt.append("""
                You are an energy-saving assistant for PowerTrack.
                Analyze the user's electricity usage.
                Give 3 short, practical and personalized energy-saving insights.
                Use simple language.
                Do not use complicated electrical terminology.

                User appliance data:
                """);

        for (Appliance appliance : appliances) {

            prompt.append(
                    "\nAppliance: "
                    + appliance.getName()
                    + ", Quantity: "
                    + appliance.getQuantity()
                    + ", Daily usage: "
                    + String.format(
                            "%.2f",
                            appliance.getDailyUsage()
                    )
                    + " kWh, Average usage time: "
                    + appliance.getHours()
                    + " hours/day."
            );
        }

        try {

            String response =
                    geminiService.getAIResponse(
                            prompt.toString()
                    );

            String[] lines =
                    response.split("\\r?\\n");

            for (String line : lines) {

                String cleaned =
                        line.replaceFirst(
                                "^\\s*[-*•]\\s*",
                                ""
                        ).trim();

                if (!cleaned.isEmpty()) {

                    insights.add(cleaned);
                }
            }

        } catch (Exception e) {

            System.out.println(
                    "Gemini AI error: "
                    + e.getMessage()
            );

            insights.add(
                    "AI insights are temporarily unavailable."
            );
        }

        return insights;
    }
}
