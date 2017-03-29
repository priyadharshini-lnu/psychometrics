class CreateLicenses < ActiveRecord::Migration[5.0]
  def change
    create_table :licenses do |t|
      t.integer :type, default: 0
      t.integer :number, default: 0
      t.integer :overuse_number, default: 0
      t.integer :used_number, default: 0
      t.boolean :unlimited, default: false
      t.references :client
      t.references :assessment
      t.references :report

      t.timestamps
    end
    add_index :licenses, [:client_id, :type], unique: true
  end
end
