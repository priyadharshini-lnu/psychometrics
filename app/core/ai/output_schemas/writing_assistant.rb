# frozen_string_literal: true

module AI
  module OutputSchemas
    class WritingAssistant < Base
      SCHEMA_AS_CONTEXT = <<~SCHEMA_CONTEXT
        The assistant must return JSON with two fields:
        - result: the main improved text
        - suggestions: an array of optional alternate versions
        - what_changed_and_why: explanation of the changes made and the reasoning
      SCHEMA_CONTEXT

      def self.context
        SCHEMA_AS_CONTEXT
      end

      string :result, description: 'Main rewritten or improved text'
      array :suggestions, of: :string, description: 'Alternate suggestions for the user, can be empty'
      string :what_changed_and_why, description: 'Explanation of modifications and the reasoning behind them'
    end
  end
end
