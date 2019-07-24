class AddUniqueIndexToQuestionRecoding < ActiveRecord::Migration[5.1]
  def change
    add_index :question_recoding, [:question_id, :assessment_id], unique: true, name: :index_question_recoding_on_question_assessment_id
  end
end
