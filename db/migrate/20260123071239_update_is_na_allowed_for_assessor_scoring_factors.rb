# frozen_string_literal: true

class UpdateIsNaAllowedForAssessorScoringFactors < ActiveRecord::Migration[7.1]
  def up
    execute <<~SQL.squish
      UPDATE campaign_factors
      SET is_na_allowed = true
      WHERE factor_type = 2;
    SQL
  end

  def down
    execute <<~SQL.squish
      UPDATE campaign_factors
      SET is_na_allowed = false
      WHERE factor_type = 2;
    SQL
  end
end
