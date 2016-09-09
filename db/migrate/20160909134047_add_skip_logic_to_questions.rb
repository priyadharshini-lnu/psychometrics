class AddSkipLogicToQuestions < ActiveRecord::Migration[5.0]
  def change
    add_column :questions, :skip_logic, :json
  end
end
