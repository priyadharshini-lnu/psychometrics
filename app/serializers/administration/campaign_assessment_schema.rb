# frozen_string_literal: true

# rubocop:disable Metrics/BlockLength
# rubocop:disable Metrics/AbcSize
# rubocop:disable Lint/UnderscorePrefixedVariableName

module Administration
  class CampaignAssessmentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:assessment_id).filled(:int?)
        required(:name).filled(:str?)
        required(:category).filled(:str?)
        required(:norm_name).maybe(:str?)
        required(:norm_id).maybe(:int?)
        required(:enable_universal_links).filled(:bool?)
        required(:universal_link).maybe(:str?)
        required(:norms).maybe do
          array(NormSchema.schema(_, _))
        end
        required(:is_external).filled(:bool?)
        required(:assessor_form_name).maybe(:str?)
        required(:permissions).hash do
          required(:import_results).filled(:bool?)
          required(:export_raw_results).filled(:bool?)
          required(:export_scoring_results).filled(:bool?)
          required(:export_raw_factor_scores).filled(:bool?)
          required(:export_normed_results).filled(:bool?)
          required(:export_external_results).filled(:bool?)
          required(:rescore_responses).filled(:bool?)
          required(:update_external_config).filled(:bool?)
          required(:remove).filled(:bool?)
          required(:schedule_assessment).filled(:bool?)
        end
        required(:has_external_norm).filled(:bool?)
        required(:available_locales).maybe(:array?).each(:str?)
        required(:all_locales).maybe(:array?).each(:str?)
        required(:external_config).maybe(:hash?)
        required(:campaign_assessment_id).filled(:int?)
        required(:prework).filled(:bool?)
        required(:workshop_activity).filled(:bool?)
        required(:workshop_activity_duration).maybe(:int?)
        required(:allow_multiple_responses).filled(:bool?)
        required(:require_scheduling).filled(:bool?)
      end
    end
  end
end

# rubocop:enable Metrics/BlockLength
# rubocop:enable Metrics/AbcSize
# rubocop:enable Lint/UnderscorePrefixedVariableName
