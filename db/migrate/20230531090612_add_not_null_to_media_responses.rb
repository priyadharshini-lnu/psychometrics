class AddNotNullToMediaResponses < ActiveRecord::Migration[6.1]
  def change
    change_column_null :media_responses, :question_id, false

    add_foreign_key :media_responses, :users_results, column: :users_result_id, on_delete: :cascade
  end
end
