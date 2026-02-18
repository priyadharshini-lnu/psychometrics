# frozen_string_literal: true

class AddWhatToLookForToFactors < ActiveRecord::Migration[8.0]
  def change
    add_column :factors, :what_to_look_for, :text
  end
end
