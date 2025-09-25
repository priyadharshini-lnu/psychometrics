# frozen_string_literal: true

class CreateInterviewQuestions < ActiveRecord::Migration[7.1]
  def change
    create_table :interview_questions do |t|
      t.string :question
      t.string :description
      t.integer :time_limit
      t.boolean :mandatory, default: false
      t.integer :question_type, default: 0 # 0 - audio, 1 - video

      t.references :project, null: false, foreign_key: { to_table: :clients, on_delete: :cascade }
      t.timestamps
    end
  end
end
