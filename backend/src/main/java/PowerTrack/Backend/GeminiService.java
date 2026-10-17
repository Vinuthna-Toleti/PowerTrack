package PowerTrack.Backend;

import org.springframework.stereotype.Service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;

@Service
public class GeminiService {

    private final Client client;

    public GeminiService() {
        String apiKey = System.getenv("GEMINI_API_KEY");

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("GEMINI_API_KEY is not set");
        }

        client = Client.builder()
                .apiKey(apiKey)
                .build();
    }

    public String getAIResponse(String prompt) {

        try {

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-3.8-flash",
                            prompt,
                            null
                    );

            String result = response.text();

            if (result == null || result.isBlank()) {
                return "No AI insight was generated.";
            }

            return result;

        } catch (Exception e) {

            String message = e.getMessage();

            System.err.println("Gemini AI error: " + message);

            if (message != null && message.contains("429")) {
                return "AI insights are temporarily unavailable because the Gemini API quota has been reached. Please try again later.";
            }

            return "AI insights are temporarily unavailable right now.";
        }
    }
}