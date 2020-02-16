# frozen_string_literal: true

class AddStepsFieldsToUsersResults < ActiveRecord::Migration[5.1]
  def change
    add_column :users_results, :current_element, :string
    add_column :users_results, :current_page, :string
    add_column :users_results, :integer, :string
    add_column :users_results, :seedrandom, :string
  end
end
