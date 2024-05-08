# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Assessments
  module Actions
    module Block
      module CreateByTemplate
        class BlockSchema < BaseSchema
          def self.schema(_, _)
            Dry::Schema.JSON do
              config.validate_keys = false

              required(:name).filled(:str?)
              required(:position).filled(:int?)
              required(:props).filled(:hash?)
              required(:created_at).filled(:str?)
              required(:template_id).filled(:int?)
              required(:deleted).filled(:bool?)
              required(:questions).array(Assessments::Actions::Block::CreateByTemplate::QuestionSchema.schema(_, _))
            end
          end
        end
      end
    end
  end
end
# rubocop:enable Lint/UnderscorePrefixedVariableName
