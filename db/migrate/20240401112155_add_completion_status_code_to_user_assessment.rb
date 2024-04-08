class AddCompletionStatusCodeToUserAssessment < ActiveRecord::Migration[7.1]
  def change
    add_column :user_assessments, :completion_status_code, :string
  end
end
