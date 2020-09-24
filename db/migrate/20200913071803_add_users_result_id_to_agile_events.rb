# frozen_string_literal: true

class AddUsersResultIdToAgileEvents < ActiveRecord::Migration[5.1]
  def change
    add_reference :agile_events, :users_result, foreign_key: true
  end
end
