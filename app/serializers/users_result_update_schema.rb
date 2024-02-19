# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName
class UsersResultUpdateSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      required(:expired).filled(:bool?)
      required(:current_block).array(BlockSchema.schema(_, _))
      required(:translations).filled(:hash?)
      required(:progress_was_reseted).maybe(:bool?)
      optional(:factors).array(UsersResults::FactorSchema.schema(_, _))
      optional(:next_assessment_url).maybe(:str?)
      optional(:scoring).maybe(:hash?)
    end
  end
end
# rubocop:enable Lint/UnderscorePrefixedVariableName
