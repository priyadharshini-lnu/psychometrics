# frozen_string_literal: true

module AI
  module OutputSchemas
    class ContentAnalysisAssistant < Base
      SCHEMA_CONTEXT = <<~SCHEMA_CONTEXT
        You must respond with a JSON object containing an array of factor_scores. You are analyzing user responses to score their performance on various factors.

        CRITICAL REQUIREMENTS:
        1. Provide scores, confidence levels, and citations for each factor
        2. Include DIRECT QUOTES (citations) from the user's responses to support each score
        3. Citations MUST be verbatim quotes from the provided transcriptions or answers. It should be in the ORIGINAL language of the transcript.
        4. RATIONALE: Explain how the citations support your score. Must ALWAYS be written in ENGLISH, regardless of the transcript language.
        5. DO NOT hallucinate or make up information - only use evidence from provided responses
        6. DO NOT make up factor_ids, use only the factor_ids provided in the prompt
      SCHEMA_CONTEXT

      def self.context
        SCHEMA_CONTEXT
      end

      array :factor_scores, description: 'Array of factor scoring results' do
        object do
          integer :factor_id,
                  description: 'The unique identifier of the factor being scored (must match factor IDs from prompt)'
          number :score, description: 'Score value assigned to the factor (use the range specified for this factor)'
          number :confidence, description: 'Confidence level (0-1, where 1 is highest confidence)'
          array :citations, of: :string,
                description: 'Direct quotes from user responses/transcriptions. MUST be verbatim.'
          string :rationale, description: 'Explanation of how the citations support the assigned score'
        end
      end
    end
  end
end
