class AddStepsFieldsToAssigns < ActiveRecord::Migration[5.1]
  def change
    add_column :assigns, :current_element, :string
    add_column :assigns, :current_page, :string
    add_column :assigns, :integer, :string
    add_column :assigns, :seedrandom, :string
  end
end
