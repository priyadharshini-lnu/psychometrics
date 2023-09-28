class AddNotNullToFactors < ActiveRecord::Migration[6.1]
  def change
    change_column_null :factors, :dimension_id, false
    add_foreign_key :factors, :dimensions, column: :dimension_id, on_delete: :cascade
  end
end
