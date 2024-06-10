class AddEvaluationSessionIdToUserAssessments < ActiveRecord::Migration[7.1]
  def change
    add_column :user_assessments, :evaluation_session_id, :string
  end
end
