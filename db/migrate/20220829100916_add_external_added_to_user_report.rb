# frozen_string_literal: true

class AddExternalAddedToUserReport < ActiveRecord::Migration[5.2]
  def change
    add_column :user_reports, :external_added, :boolean, default: false
  end
end
