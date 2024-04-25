class AddAssessmentCompletionCodeToCommunications < ActiveRecord::Migration[7.1]
  def change
    add_column :communications, :assessment_completion_status_code, :string
  end
end
