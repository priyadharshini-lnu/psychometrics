# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName
# rubocop:disable Metrics/BlockLength
# rubocop:disable Metrics/AbcSize
module Administration
  class UserAssessmentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:permissions).hash do
          required(:update_additional_time).maybe(:bool?)
          required(:update_norm).filled(:bool?)
          required(:update_mettl_schedule).filled(:bool?)
          required(:rescore_response).filled(:bool?)
          required(:remove).filled(:bool?)
          required(:reset_progress).filled(:bool?)
          required(:push_webhook).filled(:bool?)
          required(:reset_results).filled(:bool?)
        end
        required(:assessment_id).filled(:int?)
        required(:name).filled(:str?)
        required(:category).filled(:str?)
        required(:norm_name).maybe(:str?)
        required(:status).filled(:str?)
        required(:norms).maybe do
          array(NormSchema.schema(_, _))
        end
        required(:mettl_schedule_name).maybe(:str?)
        required(:mettl_schedule_record_id).maybe(:str?)
        required(:norm_id).maybe(:int?)
        required(:additional_time).maybe(:int?)
        required(:is_expired).maybe(:bool?)
        required(:is_external).filled(:bool?)
        required(:has_external_norm).filled(:bool?)
        required(:schedule_time).maybe(:str?)
        required(:require_scheduling).maybe(:bool?)
      end
    end
  end
end
# rubocop:enable Metrics/AbcSize
# rubocop:enable Lint/UnderscorePrefixedVariableName
# rubocop:enable Metrics/BlockLength
