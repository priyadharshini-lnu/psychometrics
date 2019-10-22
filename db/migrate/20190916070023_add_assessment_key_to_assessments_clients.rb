# frozen_string_literal: true

class AddAssessmentKeyToAssessmentsClients < ActiveRecord::Migration[5.1]
  def change
    add_column :assessments_clients, :assessment_key, :string
  end
end
