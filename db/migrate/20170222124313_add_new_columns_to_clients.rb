class AddNewColumnsToClients < ActiveRecord::Migration[5.0]
  def change
    change_table :clients do |t|
      t.string :number
      t.string :country
      t.integer :year
      t.integer :applicable_level
      t.references :account_manager
      t.references :project_manager
    end
  end
end
