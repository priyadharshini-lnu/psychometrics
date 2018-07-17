class CreateFactorsAliases < ActiveRecord::Migration[5.1]
  def change
    create_table :factors_aliases do |t|
      t.references :factor, null: false, index: true
      t.references :report, null: false, index: true
      t.string :name, null: false
      t.timestamps
    end

    add_index :factors_aliases, [:report_id, :factor_id], unique: true
  end
end
