class CreateProductReports < ActiveRecord::Migration[5.0]
  def change
    create_table :product_reports do |t|
      t.references :product
      t.references :report

      t.timestamps
    end
  end
end
