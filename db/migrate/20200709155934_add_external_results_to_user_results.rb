# frozen_string_literal: true

class AddExternalResultsToUserResults < ActiveRecord::Migration[5.1]
  def change
    add_column :users_results, :external_results, :jsonb, default: {}
  end
end
