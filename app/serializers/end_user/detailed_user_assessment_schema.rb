# frozen_string_literal: true

# rubocop:disable Metrics/BlockLength
# rubocop:disable Metrics/AbcSize

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
        required(:available_locales).maybe(:array?)
        required(:selected_locale).maybe(:str?)
        optional(:privacy_consent_required).maybe(:bool?)
        required(:campaign_id).maybe(:int?)
        required(:started_at).maybe(:str?)
        required(:current_campaign_expiry_date).maybe(:str?)
        required(:should_run_assessment_level_checks).filled(:bool?)
        required(:locale_data).hash do
          required(:code).filled(:str?)
          required(:name).filled(:str?)
          required(:direction).filled(:str?)
        end
        required(:piped_text_mapping).maybe(:hash?)
      end
    end
  end
end

# rubocop:enable Metrics/BlockLength
# rubocop:enable Metrics/AbcSize
