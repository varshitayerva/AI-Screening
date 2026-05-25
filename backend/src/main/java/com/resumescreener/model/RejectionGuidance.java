package com.resumescreener.model;

import com.google.gson.annotations.SerializedName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RejectionGuidance {

    @SerializedName("rejection_reasons")
    private List<String> rejectionReasons;

    private List<Improvement> improvements;

    @SerializedName("alternative_roles")
    private List<String> alternativeRoles;

    private String encouragement;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Improvement {

        private String skill;

        @SerializedName("current_level")
        private String currentLevel;

        @SerializedName("recommended_resources")
        private List<String> recommendedResources;

        @SerializedName("estimated_months")
        private int estimatedMonths;
    }
}
