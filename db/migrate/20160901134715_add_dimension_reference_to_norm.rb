class AddDimensionReferenceToNorm < ActiveRecord::Migration[5.0]
  def change
    add_reference :norms, :dimension, index: true
  end
end
