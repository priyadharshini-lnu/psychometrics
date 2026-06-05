# frozen_string_literal: true

# rubocop:disable Metrics/AbcSize
# rubocop:disable Metrics/BlockLength
module EndUser
  class UserAssessmentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:type).filled(:str?)
        required(:url).filled(:str?)
        required(:assessment_name).filled(:str?)
        optional(:timing).maybe(:str?)
        required(:assessment_category).filled(:str?)
        optional(:completed_at).maybe(:str?)
        optional(:assessment_extra).hash do
          optional(:timer).maybe(:int?)
          optional(:icon_color).maybe(:str?)
          optional(:enable_video_check).maybe(:bool?)
          optional(:enable_audio_check).maybe(:bool?)
          optional(:enable_network_check).maybe(:bool?)
          optional(:disable_navigation_back).maybe(:bool?)
          optional(:disable_continue_to_dashboard).maybe(:bool?)
        end
        required(:assessment_id).filled(:int?)
        required(:status).filled(:str?)
        required(:completion_percent).filled(:int?)
        required(:completion_reason).maybe(:str?)
        required(:available_locales).maybe(:array?)
        required(:selected_locale).maybe(:str?)
        required(:assessment_icon_url).maybe(:str?)
        required(:prework).maybe(:bool?)
        required(:schedule_time).maybe(:str?)
        required(:workshop_activity_duration).maybe(:int?)
        required(:workshop_activity).maybe(:bool?)
        required(:meeting_time).maybe(:str?)
        required(:meeting_link).maybe(:str?)
        required(:require_scheduling).maybe(:bool?)
        required(:evaluation_session_id).maybe(:str?)
        optional(:caching_enabled).maybe(:bool?)
        optional(:schema_validation_error).maybe(:str?)
      end
    end
  end
end
# rubocop:enable Metrics/AbcSize
# rubocop:enable Metrics/BlockLength
