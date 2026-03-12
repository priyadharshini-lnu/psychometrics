# frozen_string_literal: true

class AddCampaignAndAssessmentToPrivacyConsents < ActiveRecord::Migration[8.0]
  def change
    change_table :privacy_consents, bulk: true do |t|
      t.references :campaign, foreign_key: true, null: true
      t.references :assessment, foreign_key: true, null: true
      t.integer :data_role, limit: 2, default: 0, null: false
    end
  end
end
