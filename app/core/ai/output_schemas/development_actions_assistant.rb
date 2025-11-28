# frozen_string_literal: true

require_relative 'base'

module AI
  module OutputSchemas
    class DevelopmentActionsAssistant < Base
      def self.context
        <<~CONTEXT
          You must respond with a JSON object containing an array of recommendations. Each recommendation must have the required fields.
        CONTEXT
      end

      array :recommendations, description: 'Array of development action recommendations' do
        object do
          string :name, description: 'A concise name for the development action'
          string :description, description: 'A detailed description of the learning activity'
          string :learning_style, description: 'The learning style category',
                enum: %w[structured_learning learning_from_others on_the_job]
        end
      end
    end
  end
end
