# frozen_string_literal: true

class AddSkillIdToQuestions < ActiveRecord::Migration[7.1]
  def change
    add_reference :questions, :skill, null: true, foreign_key: true
  end
end
