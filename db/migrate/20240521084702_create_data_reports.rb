class CreateDataReports < ActiveRecord::Migration[7.1]
  def change
    create_table :data_reports do |t|
      t.string :name
      t.jsonb :configuration
      t.integer :owner_id
      t.integer :last_updated_by_id

      t.timestamps
    end
  end
end
