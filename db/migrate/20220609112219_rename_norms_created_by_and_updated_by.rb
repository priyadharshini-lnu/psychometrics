# frozen_string_literal: true

class RenameNormsCreatedByAndUpdatedBy < ActiveRecord::Migration[5.2]
  def change
    rename_column :norms, :created_by, :created_by_id
    rename_column :norms, :updated_by, :updated_by_id
  end
end
