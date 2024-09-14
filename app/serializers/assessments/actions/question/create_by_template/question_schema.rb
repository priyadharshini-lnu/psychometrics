# frozen_string_literal: true

module Assessments
  module Actions
    module Question
      module CreateByTemplate
        class QuestionSchema < BaseSchema
          def self.schema(_, _)
            Dry::Schema.JSON do
              config.validate_keys = false

              required(:name).filled(:str?)
              required(:type).filled(:str?)
              required(:position).filled(:int?)
              required(:props).filled(:hash?)
              required(:deleted).filled(:bool?)
              required(:created_at).filled(:str?)
              required(:validation).filled(:hash?)
              required(:required_validation).filled(:hash?)
              required(:display_logic).filled(:hash?)
              required(:skip_logic).filled(:hash?)
              required(:template_id).filled(:int?)
            end
          end
        end
      end
    end
  end
end
