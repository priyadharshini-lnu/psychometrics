# frozen_string_literal: true

class RemoveProjectIdFromUserAssessment < ActiveRecord::Migration[5.2]
  def change
    remove_column :user_assessments, :project_id
  end
end
