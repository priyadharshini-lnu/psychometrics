# frozen_string_literal: true

module Administration
  module Campaigns
    class CampaignOptionsSerializer < Panko::Serializer
      attributes :fixed_time, :time_zone, :fixed_time_duration, :instructions_enabled, :instructions,
                 :proctoring_enabled, :rules, :identification, :description, :integration_type,
                 :proctoring_trial, :workshop_booking_requires_prework_completion, :show_watermark, :watermark_content,
                 :proctoring_type, :workshop_invite_requires_prework_completion,
                 :proctoring_enabled_on_workshop_activity, :enable_video_call_recording,
                 :enable_mobile_proctoring, :allow_video_call_recording, :system_check_enabled,
                 :system_check_validity, :allow_continue_with_warning,
                 :minimum_upload_speed, :minimum_download_speed,
                 :calculated_minimum_upload_speed, :calculated_minimum_download_speed,
                 :skip_assessment_level_checks, :face_detection_enabled, :minimum_face_detection_ratio,
                 :phrase_verification_enabled, :selective_proctoring_enabled
      delegate :campaign, to: :object
      delegate :calculated_minimum_upload_speed, :calculated_minimum_download_speed, to: :campaign
    end
  end
end
