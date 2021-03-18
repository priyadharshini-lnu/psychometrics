# frozen_string_literal: true

class RemoveRedundantColumnFromUsersResults < ActiveRecord::Migration[5.2]
  def change
    remove_column :users_results, :subject_id
    remove_column :users_results, :evaluator_id
    remove_column :users_results, :assessment_id
    remove_column :users_results, :campaign_id
  end
end
