# frozen_string_literal: true

class AddUsersResultToMediaResponses < ActiveRecord::Migration[5.1]
  def change
    add_column :media_responses, :users_result_id, :integer
    add_column :media_responses, :assign_id, :integer
  end
end
