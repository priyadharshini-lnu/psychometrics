# frozen_string_literal: true

class AddDefaultStatuses < ActiveRecord::Migration[5.1]
  def change
    change_column :participants, :manager_status, :integer, default: 0
    change_column :participants, :evaluator_status, :integer, default: 0
  end
end
