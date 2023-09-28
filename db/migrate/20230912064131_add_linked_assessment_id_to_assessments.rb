class AddLinkedAssessmentIdToAssessments < ActiveRecord::Migration[7.0]
  def change
    add_column :assessments, :linked_assessment_id, :integer, foreign_key: { on_delete: :nullify }
    add_column :assessments, :linked_questions, :json, default: {}
  end
end
