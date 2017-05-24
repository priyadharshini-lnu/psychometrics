class FixLicenseReportFamilyIndex < ActiveRecord::Migration[5.0]
  def up
    remove_index :licenses, column: :report_family_id
    add_index(:licenses, [:client_id, :report_family_id], unique: true)
  end

  def down
    raise IrreversibleMigration
  end
end
