# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

class BlockSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      required(:id).filled(:int?)
      required(:name).filled(:str?)
      required(:position).value { int? | float? | nil? }
      required(:deleted).filled(:bool?)
      required(:props).filled(:hash?)
      required(:created_at).filled(:str?)
      required(:template_id).maybe(:int?)
      required(:questions).array(QuestionSchema.schema(_, _))
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
