# frozen_string_literal: true

class AddMindmillPrefixToAssigns < ActiveRecord::Migration[5.1]
  def change
    add_column :assigns, :mindmill_prefix, :string
  end
end
