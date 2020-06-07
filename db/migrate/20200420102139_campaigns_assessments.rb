# frozen_string_literal: true

class CampaignsAssessments < ActiveRecord::Migration[5.1]
  def change
    create_table :campaigns_assessments do |t|
      t.belongs_to :assessment, foreign_key: { on_delete: :restrict }
      t.belongs_to :campaign, foreign_key: { on_delete: :cascade }
      t.integer :position, null: false, default: 1
      t.boolean :enable_universal_links, null: false, default: false
      t.string :assessment_key
      t.datetime :key_generated_at
      t.datetime :key_expires_at

      t.timestamps
    end
  end
end
