# frozen_string_literal: true

class AddInnovationStylesToUsersResults < ActiveRecord::Migration[5.1]
  def change
    add_column :users_results, :innovation_styles, :jsonb, default: []
  end
end
