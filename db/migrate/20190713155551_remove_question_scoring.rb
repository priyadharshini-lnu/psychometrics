class RemoveQuestionScoring < ActiveRecord::Migration[5.1]
  def change
    remove_column :users_results, :question_scoring
  end
end
