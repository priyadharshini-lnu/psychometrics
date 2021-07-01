# frozen_string_literal: true

class CreateSavilleFactors < ActiveRecord::Migration[5.2]
  def change
    create_table :saville_factors do |t|
      t.string :assessment_id
      t.string :factor_id
      t.string :name
      t.string :score_type
      t.string :value_type
    end
  end
end
