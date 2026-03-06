# frozen_string_literal: true

class CreateAssessmentAssistants < ActiveRecord::Migration[8.0]
  def change
    create_table :assessment_assistants do |t|
      t.references :assessment, null: false, foreign_key: true
      t.references :ai_assistant, null: false, foreign_key: true
      t.text :assessment_prompt
      t.timestamps
    end
  end
end
