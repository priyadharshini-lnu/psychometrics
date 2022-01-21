# frozen_string_literal: true

class AddNormIdToPearsonUserAssessment < ActiveRecord::Migration[5.2]
  def change
    add_column :pearson_user_assessments, :norm_id, :string
  end
end
