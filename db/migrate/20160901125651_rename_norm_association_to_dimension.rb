class RenameNormAssociationToDimension < ActiveRecord::Migration[5.0]
  def change
    rename_column :assessments, :norm_id, :dimension_id
  end
end
