class AddColumnsToNominationRequirements < ActiveRecord::Migration[5.1]
  def change
    add_column :threesixty_nomination_requirements, :position, :integer, null: false
    add_column :threesixty_nomination_requirements, :name, :string, null: false
  end
end
