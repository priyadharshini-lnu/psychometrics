class AddDimentionIdToInnovationStyles < ActiveRecord::Migration[5.1]
  def change
    add_reference :innovation_styles, :dimension, foreign_key: true
  end
end
