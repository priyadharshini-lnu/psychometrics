# frozen_string_literal: true

module AI
  module OutputSchemas
    class ContentAnalysisAssistant < Base
      SCHEMA_CONTEXT = <<~SCHEMA_CONTEXT
        You must respond with a JSON object containing an array of indicator_scores. You are analyzing user responses to score their performance on various indicators grouped under competencies.

        CRITICAL REQUIREMENTS:
        1. Provide scores, confidence levels, and citations for EVERY indicator provided in the prompt
        2. Include DIRECT QUOTES (citations) from the user's responses to support each score
        3. Citations MUST be verbatim quotes from the provided transcriptions or answers. It should be in the ORIGINAL language of the transcript.
        4. RATIONALE: Explain how the citations support your score. Must ALWAYS be written in ENGLISH, regardless of the transcript language.
        5. DO NOT hallucinate or make up information - only use evidence from provided <candidate_responses> tag
        6. DO NOT make up indicator_ids, use only the indicator ids from the <indicator id="..."> tags provided in the prompt
        7. For each citation, classify its sentiment relative to the specific indicator being scored:
           "positive" if the quote demonstrates the candidate exhibiting the behavior this indicator measures,
           "negative" if the quote reveals the candidate struggling with or falling short of what this indicator requires.
      SCHEMA_CONTEXT

      CITATION_SENTIMENT_DESCRIPTION =
        'Classify relative to this specific indicator\'s criteria. ' \
        '"positive" if the quote demonstrates the candidate exhibiting ' \
        'the behavior or competency this indicator measures. ' \
        '"negative" if the quote reveals the candidate struggling with, ' \
        'avoiding, or falling short of what this indicator requires. ' \
        'Must be one of: positive, negative'

      INDICATOR_SCORES_DESCRIPTION =
        'Array of indicator scoring results. ' \
        'Must include one entry for EVERY <indicator> in the prompt.'

      def self.context
        SCHEMA_CONTEXT
      end

      array :indicator_scores, description: INDICATOR_SCORES_DESCRIPTION do
        object do
          integer :indicator_id,
                  description: 'The id attribute from the <indicator id="..."> tag in the prompt'

          number :score,
                 description: 'Score value assigned to the indicator (use the range specified for this indicator)'

          number :confidence,
                 description: 'Confidence level (0-1, where 1 is highest confidence)'

          array :citations,
                description: 'Direct quotes from user responses/transcriptions. MUST be verbatim.' do
            object do
              string :text,
                     description: 'The verbatim quote from the user response or transcription'

              string :sentiment, description: CITATION_SENTIMENT_DESCRIPTION
            end
          end

          string :rationale,
                 description: 'Explanation of how the citations support the assigned score'
        end
      end
    end
  end
end
