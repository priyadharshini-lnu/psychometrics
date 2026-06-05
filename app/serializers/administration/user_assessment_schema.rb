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
          required(:update_content_variation).filled(:bool?)
          required(:update_simulation_time_extension).filled(:bool?)
          required(:rescore_response).filled(:bool?)
          required(:rescore_ai_response).filled(:bool?)
          required(:remove).filled(:bool?)
          required(:reset_progress).filled(:bool?)
          required(:push_webhook).filled(:bool?)
          required(:reset_results).filled(:bool?)
          required(:mark_complete).filled(:bool?)
          required(:update_mhs_confidence_interval).filled(:bool?)
          required(:update_mhs_leadership_bar).filled(:bool?)
          required(:update_mhs_norm_region).filled(:bool?)
          required(:update_mhs_norm_option).filled(:bool?)
          optional(:normalize_factor_scores).maybe(:bool?)
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
        required(:prework).maybe(:bool?)
        required(:started_at).maybe(:str?)
        required(:completed_at).maybe(:str?)
        required(:dimension_id).maybe(:int?)
        required(:users_result_id).maybe(:int?)
        required(:simulation_content_variations).maybe do
          array(SimulationContentVariationSchema.schema(_, _))
        end
        required(:simulation_user_assessment_details).maybe do
          hash(Administration::SimulationUserAssessmentSchema.schema(_, _))
        end
        required(:hogan_user_assessment_details).maybe do
          hash(Administration::HoganUserAssessmentSchema.schema(_, _))
        end
        required(:saville_user_assessment_details).maybe do
          hash(Administration::SavilleUserAssessmentSchema.schema(_, _))
        end
        required(:pearson_user_assessment_details).maybe do
          hash(Administration::PearsonUserAssessmentSchema.schema(_, _))
        end
        required(:skillvue_user_assessment_details).maybe do
          hash(Administration::SkillvueUserAssessmentSchema.schema(_, _))
        end
        required(:yoodli_user_assessment_details).maybe do
          hash(Administration::YoodliUserAssessmentSchema.schema(_, _))
        end
        required(:mhs_user_assessment_details).maybe do
          hash(Administration::MhsUserAssessmentSchema.schema(_, _))
        end
        required(:microsite_user_assessment_details).maybe do
          hash(Administration::MicrositeUserAssessmentSchema.schema(_, _))
        end
        required(:hogan_participant_id).maybe(:str?)
      end
    end
  end
end
# rubocop:enable Metrics/AbcSize
# rubocop:enable Lint/UnderscorePrefixedVariableName
# rubocop:enable Metrics/BlockLength
