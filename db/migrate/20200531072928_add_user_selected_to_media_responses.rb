# frozen_string_literal: true

class AddUserSelectedToMediaResponses < ActiveRecord::Migration[5.1]
  def change
    add_column :media_responses, :user_selected, :boolean, default: false
  end
end
