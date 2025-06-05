# frozen_string_literal: true

class CreateIdpTemplateReflectionQuestions < ActiveRecord::Migration[7.1]
  def change
    create_table :idp_template_reflection_questions do |t|
      t.references :idp_template, null: false, foreign_key: { to_table: :idp_templates, on_delete: :cascade }
      t.references :reflection_question, null: false,
                    foreign_key: { to_table: :reflection_questions, on_delete: :cascade }
      t.timestamps
    end
  end
end
