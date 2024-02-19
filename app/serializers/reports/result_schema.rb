# frozen_string_literal: true

# rubocop:disable Metrics/AbcSize
# rubocop:disable Lint/UnderscorePrefixedVariableName
# rubocop:disable Metrics/BlockLength

module Reports
  class ResultSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = false

        required(:id).filled(:int?)
        required(:status).filled(:str?)
        required(:answers).value { hash? | array? | nil? }
        required(:results).value { hash? | array? | nil? }
        required(:scoring).maybe(:hash?)
        required(:user_id).filled(:int?)
        required(:assessment_id).filled(:int?)
        required(:data_sheet).maybe(:hash?)
        required(:relationship).maybe(:str?)
        required(:norm_id).maybe(:int?)
        required(:embedded_data).maybe(:hash?)
        required(:manager_evaluation_status).filled(:str?)
        required(:subject_datasheet).maybe(:hash?)
        required(:external_scoring).maybe(:hash?)
        required(:occupations).array do
          hash do
            required(:id).filled(:int?)
            required(:name).filled(:str?)
            required(:stars).filled(:int?)
          end
        end
        required(:innovation_styles).array do
          hash do
            required(:id).filled(:int?)
            required(:value).filled(:str?)
          end
        end
        required(:user).hash(UserSchema.schema(_, _))
        required(:media_responses).array(MediaResponseSchema.schema(_, _))
      end
    end
  end
end

# rubocop:enable Metrics/AbcSize
# rubocop:enable Lint/UnderscorePrefixedVariableName
# rubocop:enable Metrics/BlockLength
