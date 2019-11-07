# frozen_string_literal: true

class CleanupOrphanedFactorsNorms < ActiveRecord::Migration[5.1]
  def change
    FactorsNorm.where(
      [
        'factor_id NOT IN (?) OR norm_id NOT IN (?)',
        Factor.pluck('id'),
        Norm.pluck('id')
      ]
    ).destroy_all
  end
end
