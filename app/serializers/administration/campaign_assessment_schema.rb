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
        required(:caching_enabled).filled(:bool?)
        required(:allow_caching).filled(:bool?)
        required(:permissions).hash do
          required(:import_results).filled(:bool?)
          optional(:import_external_scoring).filled(:bool?)
          required(:export_raw_results).filled(:bool?)
          required(:export_scoring_results).filled(:bool?)
          required(:export_raw_factor_scores).filled(:bool?)
          required(:export_ai_factor_scores).filled(:bool?)
          required(:export_normed_results).filled(:bool?)
          required(:export_external_results).filled(:bool?)
          required(:rescore_responses).filled(:bool?)
          required(:rescore_ai_responses).filled(:bool?)
          required(:regenerate_transcriptions).filled(:bool?)
          required(:update_external_config).filled(:bool?)
          required(:remove).filled(:bool?)
          required(:schedule_assessment).filled(:bool?)
          required(:toggle_auto_assign).filled(:bool?)
          required(:update_mettl_schedule).filled(:bool?)
          optional(:normalize_factor_scores).maybe(:bool?)
          required(:update_content_variation).filled(:bool?)
          required(:update_pearson_variation).filled(:bool?)
          required(:update_mhs_confidence_interval).filled(:bool?)
          required(:update_mhs_leadership_bar).filled(:bool?)
          required(:update_mhs_norm_region).filled(:bool?)
          required(:update_mhs_norm_option).filled(:bool?)
          required(:update_available_locales).filled(:bool?)
          optional(:export_occupations).filled(:bool?)
          required(:toggle_require_scheduling).filled(:bool?)
          required(:update_prework).filled(:bool?)
          required(:toggle_caching).filled(:bool?)
          required(:update_occupation_condition_set).filled(:bool?)
        end
        required(:has_external_norm).filled(:bool?)
        required(:available_locales).maybe(:array?).each(:str?)
        required(:all_locales).maybe(:array?).each(:str?)
        required(:external_config).hash do
          optional(:duration).maybe(:int?)
          optional(:passPercentage).maybe(:int?)
          optional(:content_variation_id).maybe(:str?)
          optional(:variation).maybe(:str?)
          optional(:confidence_interval).maybe(:int?)
          optional(:leadership_bar).maybe(:int?)
          optional(:norm_region).maybe(:int?)
          optional(:norm_option).maybe(:int?)
        end
        required(:campaign_assessment_id).filled(:int?)
        required(:prework).filled(:bool?)
        required(:workshop_activity).filled(:bool?)
        required(:workshop_activity_duration).maybe(:int?)
        required(:allow_multiple_responses).filled(:bool?)
        required(:require_scheduling).filled(:bool?)
        required(:auto_assign).filled(:bool?)
        required(:mettl_schedule_name).maybe(:str?)
        required(:mettl_schedule_record_id).maybe(:str?)
        required(:dimension_id).maybe(:int?)
        required(:simulation_content_variations).maybe do
          array(SimulationContentVariationSchema.schema(_, _))
        end
        required(:pearson_variations).maybe do
          array(PearsonVariationSchema.schema(_, _))
        end
        required(:mhs_norm_regions).maybe do
          array(MhsNormRegionSchema.schema(_, _))
        end
        required(:mhs_norm_options).maybe do
          array(MhsNormOptionSchema.schema(_, _))
        end
        required(:proctoring_enabled).filled(:bool?)
        required(:is_timed).filled(:bool?)
        required(:fixed_time_duration).maybe(:int?)
        required(:occupation_condition_set_id).maybe(:int?)
        required(:occupation_condition_set_name).maybe(:str?)
        required(:dimension_has_occupations).filled(:bool?)
        required(:occupation_condition_sets).maybe do
          array do
            schema do
              required(:id).filled(:int?)
              required(:name).filled(:str?)
            end
          end
        end
      end
    end
  end
end

# rubocop:enable Metrics/BlockLength
# rubocop:enable Metrics/AbcSize
# rubocop:enable Lint/UnderscorePrefixedVariableName
