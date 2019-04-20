class AddApprovedEvaluationsCountToThreesixtyEvaluators < ActiveRecord::Migration[5.1]
  def change
    add_column :threesixty_evaluators, :approved_evaluations_count, :integer, default: 0

  end
end
