# frozen_string_literal: true

class AddUseSubfactorNormScoreToFactors < ActiveRecord::Migration[5.2]
  def change
    add_column :factors, :use_sub_factor_norm_score, :boolean
  end
end
