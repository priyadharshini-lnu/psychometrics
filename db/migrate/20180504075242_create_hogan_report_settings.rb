class CreateHoganReportSettings < ActiveRecord::Migration[5.1]
  def change
    create_table :hogan_report_settings do |t|
      t.references :report, null: false, foreign_key: { on_delete: :cascade }
      t.string :hogan_report_id, null: false
      t.string :hogan_norm_id, null: false
      t.string :hogan_language_id, null: false
      t.boolean :load_report, null: false, default: false

      t.timestamps
    end
  end
end
