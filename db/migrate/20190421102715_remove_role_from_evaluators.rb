# frozen_string_literal: true

class RemoveRoleFromEvaluators < ActiveRecord::Migration[5.1]
  def change
    remove_column :threesixty_evaluators, :role
  end
end
