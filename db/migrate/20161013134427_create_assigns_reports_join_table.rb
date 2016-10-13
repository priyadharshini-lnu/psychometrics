class CreateAssignsReportsJoinTable < ActiveRecord::Migration[5.0]
  def change
    create_table :assigns_reports, id: false do |t|
      t.integer :assign_id
      t.integer :report_id
    end
    add_index :assigns_reports, [:assign_id, :report_id]
  end
end
