# frozen_string_literal: true

class AddNormTypeToUsersResults < ActiveRecord::Migration[5.1]
  def change
    add_column :users_results, :norm_type, :string
  end
end
