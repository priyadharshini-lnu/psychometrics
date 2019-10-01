# frozen_string_literal: true

class MigrateOldSubFactors < ActiveRecord::Migration[5.1]
  def change
    Factor.where.not(parent_id: nil).group_by(&:parent_id).each do |factor_id, sub_factors|
      sub_factors.each do |sub_factor|
        FactorsSubFactor.create!(factor_id: factor_id, sub_factor_id: sub_factor.id)
      end
    end
    Factor.includes(:sub_factors).find_each do |f|
      unless f.sub_factors.empty?
        f.scoring_strategy = :sub_factor_questions
        f.save!(validate: false)
      end
    end
  end
end
