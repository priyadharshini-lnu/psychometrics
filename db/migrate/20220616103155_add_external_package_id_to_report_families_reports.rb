# frozen_string_literal: true

class AddExternalPackageIdToReportFamiliesReports < ActiveRecord::Migration[5.2]
  def change
    add_column :report_families_reports, :external_package_id, :string, null: true
    add_column :report_families_reports, :id, :primary_key
    change_table :report_families_reports do |t|
      t.timestamps null: true
    end
  end
end
