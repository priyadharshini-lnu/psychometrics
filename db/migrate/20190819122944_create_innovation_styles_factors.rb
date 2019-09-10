# frozen_string_literal: true

class CreateInnovationStylesFactors < ActiveRecord::Migration[5.1]
  def change
    create_table :innovation_styles_factors do |t|
      t.references :innovation_style, foreign_key: true
      t.references :factor, foreign_key: true
      t.string :predicate
      t.float :value
      t.integer :position

      t.timestamps
    end
  end
end
