# frozen_string_literal: true

class RemoveSubfactorCount < ActiveRecord::Migration[5.1]
  def change
    remove_column :factors, :subfactors_count
  end
end
