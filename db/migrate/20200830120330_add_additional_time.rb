# frozen_string_literal: true

class AddAdditionalTime < ActiveRecord::Migration[5.1]
  def change
    add_column :users_results, :additional_time, :integer
  end
end
