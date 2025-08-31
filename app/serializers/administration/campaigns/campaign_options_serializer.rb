# frozen_string_literal: true

module Administration
  module Campaigns
    class CampaignOptionsSerializer < Panko::Serializer
      attributes :fixed_time, :time_zone, :fixed_time_duration, :instructions_enabled, :instructions,
                 :proctoring_enabled, :rules, :identification, :description, :integration_type,
                 :proctoring_trial, :workshop_booking_requires_prework_completion, :show_watermark, :watermark_content,
                 :proctoring_type, :workshop_invite_requires_prework_completion,
                 :proctoring_enabled_on_workshop_activity, :enable_video_call_recording,
                 :allow_video_call_recording
    end
  end
end
