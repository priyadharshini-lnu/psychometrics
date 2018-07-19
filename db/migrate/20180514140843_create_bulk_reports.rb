class CreateBulkReports < ActiveRecord::Migration[5.1]
  def change
    create_table :bulk_reports do |t|
      t.references :user, foreign_key: { on_delete: :cascade }
      t.integer :queue_size
      t.string :file
      t.timestamps
    end
  end
end
