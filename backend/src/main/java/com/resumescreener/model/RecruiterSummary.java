package com.resumescreener.model;

import com.google.gson.annotations.SerializedName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterSummary {

    @SerializedName("executive_summary")
    private String executiveSummary;

    private List<String> strengths;

    private List<String> concerns;

    private String recommendation;

    @SerializedName("next_steps")
    private List<String> nextSteps;

    @SerializedName("interview_readiness")
    private String interviewReadiness;
}
