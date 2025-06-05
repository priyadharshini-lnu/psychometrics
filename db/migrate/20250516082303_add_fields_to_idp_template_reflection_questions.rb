# frozen_string_literal: true

class AddFieldsToIdpTemplateReflectionQuestions < ActiveRecord::Migration[7.1]
  def change
    change_table :idp_template_reflection_questions, bulk: true do |t|
      t.boolean :mandatory, default: false
      t.integer :min_words
      t.integer :max_words
    end
  end
end
