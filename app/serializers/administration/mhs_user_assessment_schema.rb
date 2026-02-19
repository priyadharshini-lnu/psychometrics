# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName
module Administration
  class MhsUserAssessmentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:external_assessment_id).filled(:str?)
        required(:session_id).filled(:str?)
        required(:data_gatherer_id).filled(:str?)
        required(:data_gathering_id).filled(:str?)
        required(:confidence_interval).maybe(:int?)
        required(:leadership_bar).maybe(:int?)
        required(:norm_region).maybe(:int?)
        required(:norm_option).maybe(:int?)
        required(:norm_regions).maybe do
          array(MhsNormRegionSchema.schema(_, _))
        end
        required(:norm_options).maybe do
          array(MhsNormOptionSchema.schema(_, _))
        end
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
