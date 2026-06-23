# frozen_string_literal: true

class Api::V2::Administration::AssessmentConsentSettingResource < Api::V2::Administration::BaseResource
  attributes :assessment_id, :custom_consent_texts, :data_role, :policy_version, :custom_acknowledgment_texts

  has_one :assessment, class_name: 'Assessment'

  def id
    @model.id ? @model.id.to_s : "assessment_id_#{@model.assessment_id}"
  end

  def assessment_id
    @model.assessment_id.to_s
  end

  def data_role=(role)
    @model.assessment&.update(data_role: role) if role.present?
  end

  def data_role
    @model.assessment&.data_role
  end

  def custom_consent_texts=(texts)
    texts&.each do |text|
      @model.send(:custom_consent_text=, text[:text], locale: text[:locale])
    end
  end

  def custom_consent_texts
    (I18n.available_locales || ['en']).map do |locale|
      {
        locale: locale,
        text: @model.custom_consent_text(locale: locale)
      }
    end
  end

  def custom_acknowledgment_texts=(texts)
    texts&.each do |text|
      @model.send(:custom_acknowledgment_text=, text[:text], locale: text[:locale])
    end
  end

  def custom_acknowledgment_texts
    (I18n.available_locales || ['en']).map do |locale|
      {
        locale: locale,
        text: @model.custom_acknowledgment_text(locale: locale)
      }
    end
  end

  def self.find_by_key(key, options = {})
    context = options[:context]
    record = AssessmentConsentSetting.find_or_initialize_by(assessment_id: key)
    new(record, context)
  end
end
