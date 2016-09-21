class CreateReportsModules < ActiveRecord::Migration[5.0]
  def change
    create_table :reports_modules do |t|
      t.references :page, index: true
      t.string :name
      t.json :props
      t.integer :position
      t.datetime :deleted_at

      t.timestamps
    end
  end
end
