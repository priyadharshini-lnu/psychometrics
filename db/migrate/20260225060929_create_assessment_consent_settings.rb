# frozen_string_literal: true

class CreateAssessmentConsentSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :assessment_consent_settings do |t|
      t.text :custom_consent_text
      t.integer :policy_version, null: false, default: 1
      t.references :assessment, null: false, foreign_key: true, index: true
      t.timestamps
    end
  end
end
