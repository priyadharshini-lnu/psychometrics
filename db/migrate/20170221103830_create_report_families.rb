class CreateReportFamilies < ActiveRecord::Migration[5.0]
  def change
    create_table :report_families do |t|
      t.string :name, null: false
      t.timestamps
    end

    add_reference :reports, :report_family, index: true, foreign_key: true
  end
end
