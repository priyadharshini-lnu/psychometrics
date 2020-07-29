# frozen_string_literal: true

class RemoveObsoleteIndex < ActiveRecord::Migration[5.1]
  def change
    remove_index :users_results, name: 'users_results_subject_evaluator_campaign'
  end
end
