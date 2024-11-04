# frozen_string_literal: true

class Api::V2::Administration::PrivacySettingResource < Api::V2::Administration::BaseResource
  attributes :id, :privacy_consent, :custom_privacy_policy_version, :custom_privacy_consent_texts,
             :privacy_link_text, :privacy_link_url, :enable_privacy_link,
             :custom_privacy_consent, :mask_identity_for_pearson, :mask_identity_for_saville, :mask_identity_for_hogan,
             :mask_identity_for_iiht, :mask_identity_for_examus, :mask_identity_for_mettl, :disable_data_processing

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
end
