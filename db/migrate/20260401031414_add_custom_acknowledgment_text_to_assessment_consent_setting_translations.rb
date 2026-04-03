# frozen_string_literal: true

class AddCustomAcknowledgmentTextToAssessmentConsentSettingTranslations < ActiveRecord::Migration[8.0]
  def change
    add_column :assessment_consent_setting_translations, :custom_acknowledgment_text, :text
  end
end
