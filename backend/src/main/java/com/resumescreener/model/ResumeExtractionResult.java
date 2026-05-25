package com.resumescreener.model;

import com.google.gson.annotations.SerializedName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumeExtractionResult {

    private List<String> skills;

    @SerializedName("experience_years")
    private int experienceYears;

    private String education;

    private List<String> achievements;

    private List<String> strengths;

    @SerializedName("missing_requirements")
    private List<String> missingRequirements;

    @SerializedName("tech_stack")
    private List<String> techStack;

    @SerializedName("match_score")
    private int matchScore;

    private double confidence;

    private String summary;
}
