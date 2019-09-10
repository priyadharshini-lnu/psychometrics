# frozen_string_literal: true

class AddPositionToInnovationStyles < ActiveRecord::Migration[5.1]
  def change
    add_column :innovation_styles, :position, :integer
  end
end
