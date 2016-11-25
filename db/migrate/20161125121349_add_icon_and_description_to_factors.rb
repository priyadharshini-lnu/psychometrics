class AddIconAndDescriptionToFactors < ActiveRecord::Migration[5.0]
  def change
    add_column :factors, :icon, :string
    add_column :factors, :description, :text
  end
end
