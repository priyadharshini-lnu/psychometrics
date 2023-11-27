# frozen_string_literal: true

module EndUser
  class DetailedUserAssessmentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:type).filled(:str?)
        required(:url).filled(:str?)
        required(:assessment_name).filled(:str?)
        required(:timing).maybe(:str?)
        required(:assessment_category).filled(:str?)
        optional(:assessment_extra).maybe do
          hash do
            optional(:timer).maybe(:str?)
            optional(:icon_color).maybe(:str?)
            optional(:enable_video_check).maybe(:bool?)
            optional(:enable_audio_check).maybe(:bool?)
            optional(:enable_network_check).maybe(:bool?)
          end
        end
        required(:assessment_id).filled(:int?)
        required(:available_locales).maybe(:array?)
        required(:selected_locale).maybe(:str?)
        optional(:privacy_consent_required).maybe(:bool?)
        required(:campaign_id).maybe(:int?)
      end
    end
  end
end
