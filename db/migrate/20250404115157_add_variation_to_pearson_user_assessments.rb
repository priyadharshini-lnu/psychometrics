# frozen_string_literal: true

class AddVariationToPearsonUserAssessments < ActiveRecord::Migration[7.1]
  def change
    add_column :pearson_user_assessments, :variation, :string
  end
end
