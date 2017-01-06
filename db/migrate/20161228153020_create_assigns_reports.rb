class CreateAssignsReports < ActiveRecord::Migration[5.0]
  def change
    create_table :assigns_reports do |t|
      t.belongs_to :report
      t.belongs_to :assign
      t.timestamps
    end
  end
end
