# frozen_string_literal: true

class AddNormIdRoUserResults < ActiveRecord::Migration[5.1]
  def change
    remove_column :users_results, :norm_data
    add_reference :users_results, :norm, foreign_key: { on_delete: :restrict }
  end
end
