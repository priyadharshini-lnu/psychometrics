# frozen_string_literal: true

module EndUser
  class CampaignOptionsSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:time_zone).maybe(:str?)
        required(:fixed_time).maybe(:bool?)
        required(:fixed_time_duration).maybe(:int?)
        required(:instructions_enabled).filled(:bool?)
        required(:instructions).maybe(:str?)
        required(:proctoring_enabled).filled(:bool?)
        required(:proctoring_enabled_on_workshop_activity).filled(:bool?)
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
        required(:integration_type).filled(:str?)
        required(:workshop_booking_requires_prework_completion).filled(:bool?)
        required(:show_watermark).filled(:bool?)
        required(:watermark_content).maybe(:str?)
      end
    end
  end
end
