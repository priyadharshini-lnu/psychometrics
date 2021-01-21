# frozen_string_literal: true

class AddPrevPagesToUsersResults < ActiveRecord::Migration[5.1]
  def change
    add_column :users_results, :prev_pages, :json, default: []
  end
end
