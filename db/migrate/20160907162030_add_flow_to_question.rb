class AddFlowToQuestion < ActiveRecord::Migration[5.0]
  def change
    add_column :questions, :display_logic, :json
  end
end
