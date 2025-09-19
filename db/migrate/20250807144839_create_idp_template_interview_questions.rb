# frozen_string_literal: true

class CreateIdpTemplateInterviewQuestions < ActiveRecord::Migration[7.1]
  def change
    create_table :idp_template_interview_questions do |t|
      t.references :idp_template, null: false, foreign_key: { on_delete: :cascade }
      t.references :interview_question, null: false, foreign_key: { on_delete: :cascade }

      t.integer :order
      t.integer :time_limit
      t.boolean :mandatory

      t.timestamps
    end
  end
end
