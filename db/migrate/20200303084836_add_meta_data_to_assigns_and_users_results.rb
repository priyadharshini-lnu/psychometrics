# frozen_string_literal: true

class AddMetaDataToAssignsAndUsersResults < ActiveRecord::Migration[5.1]
  def change
    add_column :assigns, :meta_data, :jsonb, default: {}
    add_column :users_results, :meta_data, :jsonb, default: {}
  end
end
