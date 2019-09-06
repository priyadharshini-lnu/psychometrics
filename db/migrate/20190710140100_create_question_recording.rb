class CreateQuestionRecording < ActiveRecord::Migration[5.1]
  def change
    create_table :question_recoding do |t|
      t.belongs_to :assessment, foreign_key: { on_delete: :cascade }
      t.belongs_to :question, foreign_key: { on_delete: :cascade }
      t.jsonb :props
    end
  end
end
