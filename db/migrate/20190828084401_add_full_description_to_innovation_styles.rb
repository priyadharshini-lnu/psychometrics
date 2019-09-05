class AddFullDescriptionToInnovationStyles < ActiveRecord::Migration[5.1]
  def change
    add_column :innovation_styles, :full_description, :text
  end
end
