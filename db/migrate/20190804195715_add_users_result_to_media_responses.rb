class AddUsersResultToMediaResponses < ActiveRecord::Migration[5.1]
  def change
    add_column :media_responses, :users_result_id, :integer
  end
end
