# frozen_string_literal: true

class AddSkillIdToFactors < ActiveRecord::Migration[7.1]
  def change
    add_reference :factors, :skill, foreign_key: true, null: true
  end
end
