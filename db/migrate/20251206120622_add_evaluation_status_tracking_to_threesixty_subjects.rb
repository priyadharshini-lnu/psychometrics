# frozen_string_literal: true

class AddEvaluationStatusTrackingToThreesixtySubjects < ActiveRecord::Migration[8.0]
  def change
    add_reference :threesixty_subjects, :evaluation_status_updated_by, foreign_key: { to_table: :users }
  end
end
