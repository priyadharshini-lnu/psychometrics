# frozen_string_literal: true

class CreateReflectionQuestions < ActiveRecord::Migration[7.1]
  def change
    create_table :reflection_questions do |t|
      t.text :question
      t.boolean :mandatory, default: false
      t.integer :min_words
      t.integer :max_words
      t.timestamps

      t.references :project, null: false, foreign_key: { to_table: :clients, on_delete: :cascade }
    end

    create_table :reflection_question_translations do |t|
      t.string :question
      t.string :locale, null: false
      t.references :reflection_question, null: false, foreign_key: true
      t.timestamps
    end
  end
end
