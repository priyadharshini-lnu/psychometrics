# frozen_string_literal: true

class CreateTableSampleMigration < ActiveRecord::Migration[6.1]
  def change
    create_table :test_table do |t|
      t.text :test_field
    end
  end
end
