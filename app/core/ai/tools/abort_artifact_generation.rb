# frozen_string_literal: true

module AI
  module Tools
    class AbortArtifactGeneration < AI::Tools::Base
      # rubocop:disable Layout/LineLength
      description <<~DESC.strip
        Use this tool when you cannot generate meaningful results due to missing, insufficient, or invalid dependencies/data.
        Do NOT generate placeholder, empty, or default values—use this tool to abort the generation process instead.

        Your reason must be actionable and specific, so the user knows exactly what is missing or needs to be fixed.
        Avoid vague reasons like "Insufficient data to generate a meaningful result." Instead, clearly state what is missing or invalid and what action the user should take.

        Examples of actionable reasons:
        - "Subject data doesn't include value for 'gender' for valid summary."
        - "Instructions specify that generation should be skipped for subject because [reason]."

        Always provide a clear, actionable reason explaining why generation cannot proceed and what the user should do to resolve it.
      DESC
      param :reason,
            desc: 'A clear and specific explanation of why the generation is being aborted. This will be shown to the user.'
      # rubocop:enable Layout/LineLength

      def execute(reason:)
        message = <<~MESSAGE.strip
          Assistant aborted:
          #{reason}
        MESSAGE
        raise AI::Utils::AbortGenerationSignal, message
      end
    end
  end
end
