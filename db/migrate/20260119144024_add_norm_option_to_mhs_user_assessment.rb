# frozen_string_literal: true

class AddNormOptionToMhsUserAssessment < ActiveRecord::Migration[8.0]
  def change
    add_column :mhs_user_assessments, :norm_option, :integer, default: 0
  end
end
