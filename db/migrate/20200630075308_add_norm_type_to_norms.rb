# frozen_string_literal: true

class AddNormTypeToNorms < ActiveRecord::Migration[5.1]
  def change
    add_column :norms, :norm_type, :integer, default: 0
  end
end
