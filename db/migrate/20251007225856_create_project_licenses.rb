class CreateProjectLicenses < ActiveRecord::Migration[7.1]
  def change
    create_table :project_licenses do |t|
      t.references :project, null: false, foreign_key: { to_table: :clients }
      t.references :license, null: false, foreign_key: true
      t.boolean :enabled, default: false
      t.integer :usage_limit, default: 0, null: false
      t.integer :used_number, default: 0, null: false
      t.timestamps

      t.index [:license_id, :project_id], unique: true
    end
  end
end
