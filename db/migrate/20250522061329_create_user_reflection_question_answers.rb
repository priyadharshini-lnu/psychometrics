# frozen_string_literal: true

class CreateUserReflectionQuestionAnswers < ActiveRecord::Migration[7.1]
  def change
    create_table :user_reflection_question_answers do |t|
      t.text :answer
      t.references :reflection_question, null: false,
                   foreign_key: { to_table: :reflection_questions, on_delete: :cascade }
      t.references :user_idp_plan, null: false, foreign_key: { to_table: :user_idp_plans, on_delete: :cascade }

      t.timestamps
    end
  end
end
