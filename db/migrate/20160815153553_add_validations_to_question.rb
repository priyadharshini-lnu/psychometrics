class AddValidationsToQuestion < ActiveRecord::Migration[5.0]
  def change
    add_column :questions, :required_validation, :json
    add_column :questions, :validation, :json
  end
end
