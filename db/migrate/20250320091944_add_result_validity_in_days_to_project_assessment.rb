# frozen_string_literal: true

class AddResultValidityInDaysToProjectAssessment < ActiveRecord::Migration[7.1]
  def change
    add_column :project_assessments, :user_result_validity_in_days, :integer
  end
end
