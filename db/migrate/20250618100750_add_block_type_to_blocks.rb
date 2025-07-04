# frozen_string_literal: true

class AddBlockTypeToBlocks < ActiveRecord::Migration[7.1]
  def change
    add_column :blocks, :block_type, :integer, default: 0
  end
end
