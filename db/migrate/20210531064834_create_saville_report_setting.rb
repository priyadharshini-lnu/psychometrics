# frozen_string_literal: true

class CreateSavilleReportSetting < ActiveRecord::Migration[5.2]
  def change
    create_table :saville_report_settings do |t|
      t.references :report, null: false, foreign_key: { on_delete: :cascade }
      t.string :saville_report_id, null: false

      t.timestamps
    end
  end
end
