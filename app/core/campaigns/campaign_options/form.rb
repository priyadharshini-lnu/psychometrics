# frozen_string_literal: true

module Campaigns
  module CampaignOptions
    class Form < Rectify::Form
      attribute :campaign_id, Integer
      attribute :time_zone, String
      attribute :fixed_time, { String => Boolean }
      attribute :fixed_time_duration, Integer
      attribute :instructions_enabled, { String => Boolean }
      attribute :instructions, String
      attribute :identification, Integer
      attribute :integration_type, String
      attribute :proctoring_enabled, { String => Boolean }
      attribute :proctoring_trial, { String => Boolean }
      attribute :proctoring_type, String
      attribute :rules, Hash
      attribute :description, String
      attribute :enable_video_call_recording, { String => Boolean }
      attribute :selective_proctoring_enabled, { String => Boolean }
      attribute :hide_participant_video, Boolean
      attribute :disable_transcript_download, Boolean
      attribute :system_check_enabled, Boolean
      attribute :system_check_validity, Integer
      attribute :allow_continue_with_warning, Boolean
      attribute :skip_assessment_level_checks, Boolean
      attribute :minimum_upload_speed, Integer
      attribute :minimum_download_speed, Integer

      validates :campaign_id, presence: true
      validates :fixed_time_duration, numericality: { only_integer: true }, allow_nil: true
      validates :description, length: { maximum: 500 }
      validates :system_check_validity,
                numericality: {
                  greater_than_or_equal_to: 900,
                  message: I18n.t('admin.minimum_system_check_validity')
                },
                allow_nil: true

      validate :time_zone do
        if time_zone
          normalized_tz = TimezoneHelper.normalize(time_zone)
          unless ActiveSupport::TimeZone[normalized_tz]
            errors.add(:time_zone, :invalid)
          end
        end
      end

      validate :video_call_recording_allowed

      private

      def video_call_recording_allowed
        campaign = Campaign.find_by(id: campaign_id)
        privacy_setting = campaign&.project&.privacy_setting

        if enable_video_call_recording && privacy_setting && !privacy_setting.allow_video_call_recording
          errors.add(:enable_video_call_recording, :invalid)
        end
      end
    end
  end
end
