# frozen_string_literal: true

class AddPolymorphicOwnerAndSourceTypeToDevelopmentActions < ActiveRecord::Migration[7.1]
  def change
    add_reference :development_actions, :owner, polymorphic: true, null: true, index: true
    add_column :development_actions, :source_type, :integer, null: false, default: 0

    add_index :development_actions, :source_type
  end
end
