# frozen_string_literal: true

class AddInnovationStylesToAssigns < ActiveRecord::Migration[5.1]
  def change
    add_column :assigns, :innovation_styles, :jsonb, default: []
  end
end
