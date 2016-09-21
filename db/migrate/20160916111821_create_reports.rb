class CreateReports < ActiveRecord::Migration[5.0]
  def change
    create_table :reports do |t|
      t.references :assessment, index: true
      t.string :name
      t.boolean :disabled, default: false
      t.timestamps
    end
  end
end
