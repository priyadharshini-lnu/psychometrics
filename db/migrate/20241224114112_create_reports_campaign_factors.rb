# frozen_string_literal: true

class CreateReportsCampaignFactors < ActiveRecord::Migration[7.1]
  def change
    create_table :reports_campaign_factors do |t|
      t.string :code, null: false
      t.references :report, null: false, foreign_key: { on_delete: :cascade }
      t.string :name, null: false
      t.string :output_type, null: false

      t.timestamps
    end

    add_index :reports_campaign_factors, %i[report_id code], unique: true
  end
end
