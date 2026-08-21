# frozen_string_literal: true

class Api::V2::Administration::PrivacySettingResource < Api::V2::Administration::BaseResource
  attributes :privacy_consent, :custom_privacy_policy_version, :custom_privacy_consent_texts,
             :privacy_link_text, :privacy_link_url, :enable_privacy_link,
             :custom_privacy_consent, :mask_identity_for_pearson, :mask_identity_for_saville, :mask_identity_for_hogan,
             :mask_identity_for_iiht, :mask_identity_for_examus, :mask_identity_for_mettl, :mask_identity_for_skillvue,
             :mask_identity_for_yoodli, :disable_data_processing, :mask_identity_for_mhs,
             :allow_video_call_recording,
             :enable_video_call_recording_for_all_new_campaigns,
             :video_call_recording_expiry_in_seconds,
             :custom_privacy_acknowledgment_texts,
             :privacy_link_texts

  has_one :project

  ransack_filters %i[project_id_eq]

  def custom_privacy_consent_texts=(texts)
    texts.each do |text|
      @model.send(:custom_privacy_consent_text=, text[:text], locale: text[:locale])
    end
  end

  def custom_privacy_consent_texts
    (@model.project.locales.presence || ['en']).map do |locale|
      {
        locale: locale,
        text: @model.custom_privacy_consent_text(locale: locale)
      }
    end
  end

  def custom_privacy_acknowledgment_texts=(texts)
    texts.each do |text|
      @model.send(:custom_privacy_acknowledgment_text=, text[:text], locale: text[:locale])
    end
  end

  def custom_privacy_acknowledgment_texts
    (@model.project.locales.presence || ['en']).map do |locale|
      {
        locale: locale,
        text: @model.custom_privacy_acknowledgment_text(locale: locale)
      }
    end
  end

  def privacy_link_texts=(texts)
    texts.each do |text|
      @model.send(:privacy_link_text=, text[:text], locale: text[:locale])
    end
  end

  def privacy_link_texts
    (@model.project.locales.presence || ['en']).map do |locale|
      {
        locale: locale,
        text: @model.privacy_link_text(locale: locale)
      }
    end
  end
end
