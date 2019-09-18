# frozen_string_literal: true

class MigrateOldSubFactors < ActiveRecord::Migration[5.1]
  def change
    Factor.where.not(parent_id: nil).group_by(&:parent_id).each do |factor_id, sub_factors|
      sub_factors.each do |sub_factor|
        FactorsSubFactor.create!(factor_id: factor_id, sub_factor_id: sub_factor.id)
      end
    end
  end
end
