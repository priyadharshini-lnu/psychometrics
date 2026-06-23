# frozen_string_literal: true

module Administration
  module Campaigns
    class CampaignOptionsSchema < BaseSchema
      def self.schema(_, _) # rubocop:disable Metrics/AbcSize
        Dry::Schema.JSON do # rubocop:disable Metrics/BlockLength
          config.validate_keys = true

          required(:fixed_time).maybe(:bool?)
          required(:time_zone).maybe(:str?)
          required(:fixed_time_duration).maybe(:int?)
          required(:instructions_enabled).filled(:bool?)
          required(:instructions).maybe(:str?)
          required(:proctoring_enabled).filled(:bool?)
          required(:proctoring_enabled_on_workshop_activity).filled(:bool?)
          required(:enable_mobile_proctoring).filled(:bool?)
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
          required(:proctoring_type).filled(:str?)
          required(:proctoring_trial).filled(:bool?)
          required(:workshop_booking_requires_prework_completion).filled(:bool?)
          required(:workshop_invite_requires_prework_completion).filled(:bool?)
          required(:show_watermark).filled(:bool?)
          required(:watermark_content).maybe(:str?)
          required(:selective_proctoring_enabled).filled(:bool?)
          required(:system_check_enabled).filled(:bool?)
          required(:system_check_validity).maybe(:int?)
          required(:allow_continue_with_warning).filled(:bool?)
          required(:skip_assessment_level_checks).filled(:bool?)
          required(:minimum_upload_speed).maybe(:int?)
          required(:minimum_download_speed).maybe(:int?)
          required(:face_detection_enabled).filled(:bool?)
          required(:minimum_face_detection_ratio).maybe(:int?)
          required(:phrase_verification_enabled).filled(:bool?)
        end
      end
    end
  end
end
