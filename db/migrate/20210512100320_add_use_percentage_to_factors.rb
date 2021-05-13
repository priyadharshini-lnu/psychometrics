# frozen_string_literal: true

class AddUsePercentageToFactors < ActiveRecord::Migration[5.2]
  def change
    add_column :factors, :use_percentage, :boolean, default: false
  end
end
