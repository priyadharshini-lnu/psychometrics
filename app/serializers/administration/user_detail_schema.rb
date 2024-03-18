# frozen_string_literal: true

# rubocop:disable Metrics/BlockLength
# rubocop:disable Metrics/AbcSize
# rubocop:disable Lint/UnderscorePrefixedVariableName

module Administration
  class UserDetailSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:full_name).filled(:str?)
        required(:email).filled(:str?)
        required(:created_at).filled(:str?)
        required(:last_sign_in_at).maybe(:str?)
        required(:campaigns).array do
          hash do
            required(:id).filled(:int?)
            required(:name).maybe(:str?)
            required(:campaign_options).hash do
              required(:id).filled(:int?)
              required(:campaign_id).filled(:int?)
              required(:time_zone).maybe(:str?)
              required(:fixed_time).maybe(:bool?)
              required(:fixed_time_duration).maybe(:int?)
              required(:instructions_enabled).filled(:bool?)
              required(:instructions).maybe(:str?)
              required(:created_at).filled(:str?)
              required(:updated_at).filled(:str?)
              required(:proctoring_enabled).filled(:bool?)
              required(:identification).filled(:str?)
              required(:rules).hash do
                optional(:allow_voices).maybe(:bool?)
                optional(:allow_to_use_books).maybe(:bool?)
                optional(:allow_to_use_excel).maybe(:bool?)
                optional(:allow_to_use_paper).maybe(:bool?)
                optional(:allow_to_use_websites).maybe(:bool?)
                optional(:allow_absence_in_frame).maybe(:bool?)
                optional(:allow_to_use_calculator).maybe(:bool?)
                optional(:allow_to_use_messengers).maybe(:bool?)
                optional(:allow_wrong_gaze_direction).maybe(:bool?)
                optional(:allow_to_use_human_assistant).maybe(:bool?)
              end
              required(:description).maybe(:str?)
              required(:integration_type).filled(:str?)
              required(:proctoring_trial).filled(:bool?)
              required(:workshop_booking_requires_prework_completion).filled(:bool?)
              required(:campaign_scoring_variables).maybe(:str?)
              optional(:proctoring_type).maybe(:str?)
            end
          end
        end
        required(:started_at).maybe(:str?)
        required(:completion_status).filled(:str?)
        required(:status).filled(:str?)
        required(:additional_time).maybe(:int?)
        required(:active).filled(:bool?)
        required(:hogan_id).maybe(:str?)
        required(:permissions).hash do
          required(:add_report).filled(:bool?)
          required(:regenerate_report).filled(:bool?)
          required(:toggle_status).filled(:bool?)
          required(:remove).filled(:bool?)
        end
        required(:completed_at).maybe(:str?)
        required(:user_assessments).array(Administration::UserAssessmentSchema.schema(_, _))
        required(:user_reports).array(Administration::UserReportSchema.schema(_, _))
        required(:proctoring_sessions).array(Administration::ProctoringSessionSchema.schema(_, _))
      end
    end
  end
end

# rubocop:enable Metrics/BlockLength
# rubocop:enable Metrics/AbcSize
# rubocop:enable Lint/UnderscorePrefixedVariableName
