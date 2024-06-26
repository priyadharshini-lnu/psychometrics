# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName
class UsersResultUpdateSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      required(:expired).maybe(:bool?)
      required(:current_block).maybe do
        hash(BlockSchema.schema(_, _))
      end
      required(:translations).maybe(:hash?)
      required(:progress_was_reseted).maybe(:bool?)
      required(:factors).maybe do
        array(UsersResults::FactorSchema.schema(_, _))
      end
      required(:next_assessment_url).maybe(:str?)
      required(:scoring).maybe(:hash?)
      required(:evaluation_session_id).maybe(:str?)
    end
  end
end
# rubocop:enable Lint/UnderscorePrefixedVariableName
