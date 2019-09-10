# frozen_string_literal: true

class AddExternalResultToAssigns < ActiveRecord::Migration[5.1]
  def change
    add_column :assigns, :external_results, :json
  end
end
