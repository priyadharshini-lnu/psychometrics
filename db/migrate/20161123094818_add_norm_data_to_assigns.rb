class AddNormDataToAssigns < ActiveRecord::Migration[5.0]
  def change
    add_column :assigns, :norm_data, :jsonb
  end
end
