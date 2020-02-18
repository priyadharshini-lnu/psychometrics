# frozen_string_literal: true

class AddStepsFieldsToAssigns < ActiveRecord::Migration[5.1]
  def change
    add_column :assigns, :current_element, :string
    add_column :assigns, :current_page, :integer
    add_column :assigns, :seedrandom, :string
  end
end
