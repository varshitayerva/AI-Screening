package com.resumescreener.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisRequest {

    private String sessionId;
    private String resumeText;
    private String jobDescription;
}
