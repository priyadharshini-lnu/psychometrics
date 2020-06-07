# frozen_string_literal: true

class AddResetCountToAssigns < ActiveRecord::Migration[5.1]
  def change
    add_column :assigns, :reset_count, :integer, default: 0
  end
end
