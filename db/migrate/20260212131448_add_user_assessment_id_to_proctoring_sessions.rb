# frozen_string_literal: true

class AddUserAssessmentIdToProctoringSessions < ActiveRecord::Migration[7.1]
  def change
    return if column_exists?(:proctoring_sessions, :user_assessment_id)

    add_reference :proctoring_sessions, :user_assessment, null: true, foreign_key: true, index: true
  end
end
