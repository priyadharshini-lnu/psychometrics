# frozen_string_literal: true

class RemoveCounterColumnsFromSubjecAndEvaluators < ActiveRecord::Migration[5.1]
  def change
    remove_column :threesixty_subjects, :evaluators_count
    remove_column :threesixty_subjects, :completed_evaluators_count

    remove_column :threesixty_evaluators, :evaluations_count
    remove_column :threesixty_evaluators, :completed_evaluations_count
  end
end
