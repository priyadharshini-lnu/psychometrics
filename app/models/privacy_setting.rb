# frozen_string_literal: true

class PrivacySetting < ApplicationRecord
  audited
  include ApplicationConfigurationLoggable

  extend Mobility

  belongs_to :project
  include Tenantable

  translates :custom_privacy_consent_text, :custom_privacy_acknowledgment_text

  after_commit :subscribe_to_dailyco_webhook, if: :video_recording_enabled_now?

  def self.ransackable_attributes(_auth_object = nil)
    %w[id project_id]
  end

  private

  def video_recording_enabled_now?
    saved_change_to_allow_video_call_recording? && allow_video_call_recording?
  end

  def subscribe_to_dailyco_webhook
    DailyCo::SubscribeToWebhookJob.perform_later
  end
end
