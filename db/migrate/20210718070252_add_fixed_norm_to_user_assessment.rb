# frozen_string_literal: true

class AddFixedNormToUserAssessment < ActiveRecord::Migration[5.2]
  def change
    add_column :user_assessments, :fixed_norm, :boolean, default: false
  end
end
