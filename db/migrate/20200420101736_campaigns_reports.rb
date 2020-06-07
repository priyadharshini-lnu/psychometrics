# frozen_string_literal: true

class CampaignsReports < ActiveRecord::Migration[5.1]
  def change
    create_table :campaigns_reports do |t|
      t.belongs_to :report, foreign_key: { on_delete: :restrict }
      t.belongs_to :report_family, foreign_key: { on_delete: :restrict }
      t.belongs_to :campaign, foreign_key: { on_delete: :cascade }
      t.boolean :user_access, null: false, default: false

      t.timestamps
    end
  end
end
