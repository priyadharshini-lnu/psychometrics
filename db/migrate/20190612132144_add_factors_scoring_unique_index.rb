# frozen_string_literal: true

class AddFactorsScoringUniqueIndex < ActiveRecord::Migration[5.1]
  def change
    add_index :factors_scoring, %i[factor_id question_id assessment_id], unique: true,
              name: :index_factors_scoring_on_factor_question_assessment_id
  end
end
