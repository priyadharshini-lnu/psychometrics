# frozen_string_literal: true

class AddCustomAcknowledgmentTextToAssessmentConsentSettings < ActiveRecord::Migration[8.0]
  def change
    add_column :assessment_consent_settings, :custom_acknowledgment_text, :text
  end
end
