# frozen_string_literal: true

class Api::V2::PrivacySettings::Schema < Api::Base::Schema
  # rubocop:disable Metrics/AbcSize
  # rubocop:disable Metrics/BlockLength
  def self.resource
    'privacy_settings'
  end

  def self.attributes(_attribute, _)
    proc do
      optional(:mask_identity_for_pearson).maybe(:bool)
      optional(:mask_identity_for_saville).maybe(:bool)
      optional(:mask_identity_for_hogan).maybe(:bool)
      optional(:mask_identity_for_iiht).maybe(:bool)
      optional(:mask_identity_for_examus).maybe(:bool)
      optional(:mask_identity_for_mettl).maybe(:bool)
      optional(:mask_identity_for_skillvue).maybe(:bool)
      optional(:mask_identity_for_yoodli).maybe(:bool)
      optional(:mask_identity_for_mhs).maybe(:bool)
      optional(:disable_data_processing).maybe(:bool)
      optional(:privacy_consent).maybe(:bool)
      optional(:custom_privacy_consent).maybe(:bool)
      optional(:custom_privacy_policy_version).maybe(:integer)
      optional(:custom_privacy_consent_texts).array(:hash) do
        required(:locale).filled(:string)
        required(:text).maybe(:string)
      end
      optional(:enable_privacy_link).maybe(:bool)
      optional(:privacy_link_text).maybe(:string)
      optional(:privacy_link_url).maybe(:string)
      optional(:privacy_link_texts).array(:hash) do
        required(:locale).filled(:string)
        required(:text).maybe(:string)
      end
      optional(:allow_video_call_recording).maybe(:bool)
      optional(:enable_video_call_recording_for_all_new_campaigns).maybe(:bool)
      optional(:video_call_recording_expiry_in_seconds).maybe(:integer)
      optional(:custom_privacy_acknowledgment_texts).array(:hash) do
        required(:locale).filled(:string)
        required(:text).maybe(:string)
      end
    end
  end
  # rubocop:enable Metrics/AbcSize
  # rubocop:enable Metrics/BlockLength
end
