# frozen_string_literal: true

class AddIndexToAssessmentsLinkedAssessorForm < ActiveRecord::Migration[7.1]
  def change
    add_index :assessments, :linked_assessment_id
  end
end
