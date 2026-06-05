# frozen_string_literal: true

class CampaignOptions < ApplicationRecord
  audited

  extend Mobility

  belongs_to :campaign
  include Tenantable

  translates :instructions, :description

  enum :identification, { passport: 0, face: 1, face_and_passport: 2 }
  enum :integration_type, { iframe: 0, ldb: 1 }
  enum :proctoring_type, { offline: 0, online: 1 }

  before_create :set_enable_video_call_recording_from_project
  before_update :disable_dependent_proctoring_settings, if: :proctoring_enabled_changed?

  def allow_video_call_recording
    campaign.project.privacy_setting.allow_video_call_recording
  end

  private

  def disable_dependent_proctoring_settings
    if proctoring_enabled == false
      self.proctoring_enabled_on_workshop_activity = false
      self.selective_proctoring_enabled = false
    end
  end

  def set_enable_video_call_recording_from_project
    privacy_setting = campaign&.project&.privacy_setting

    return unless privacy_setting

    if privacy_setting.allow_video_call_recording && privacy_setting.enable_video_call_recording_for_all_new_campaigns
      self.enable_video_call_recording = true
    end
  end
end
