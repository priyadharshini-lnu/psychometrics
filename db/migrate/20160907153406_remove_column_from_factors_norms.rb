class RemoveColumnFromFactorsNorms < ActiveRecord::Migration[5.0]
  def change
    remove_column :factors_norms, :score_from
    remove_column :factors_norms, :score_to
    remove_column :factors_norms, :level
  end
end
