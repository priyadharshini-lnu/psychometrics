class AddCreatedByAndUpdateByAndDescriptionToApiKey < ActiveRecord::Migration[7.0]
  def change
    add_reference :api_keys, :created_by, foreign_key:  { on_delete: :nullify, to_table: :users }
    add_reference :api_keys, :updated_by, foreign_key:  { on_delete: :nullify, to_table: :users }
    add_column :api_keys, :description, :text, null: true
  end
end
