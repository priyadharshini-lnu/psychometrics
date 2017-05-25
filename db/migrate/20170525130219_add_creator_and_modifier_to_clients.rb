class AddCreatorAndModifierToClients < ActiveRecord::Migration[5.0]
  def change
    change_table :clients do |t|
      t.references :created_by
      t.references :modified_by
    end
  end
end
