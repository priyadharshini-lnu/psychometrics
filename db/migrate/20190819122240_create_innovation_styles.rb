# frozen_string_literal: true

class CreateInnovationStyles < ActiveRecord::Migration[5.1]
  def change
    create_table :innovation_styles do |t|
      t.string :name
      t.string :icon
      t.text :description

      t.timestamps
    end
  end
end
