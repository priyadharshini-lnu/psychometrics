class AddPropsToBlocks < ActiveRecord::Migration[5.0]
  def change
    add_column :blocks, :props, :json
  end
end
