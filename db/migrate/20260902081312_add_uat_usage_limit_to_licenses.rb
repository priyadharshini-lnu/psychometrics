# frozen_string_literal: true

class AddUatUsageLimitToLicenses < ActiveRecord::Migration[8.0]
  def change
    add_column :licenses, :uat_usage_limit, :integer, default: 0, null: false

    add_column :license_usages, :is_uat, :boolean, default: false, null: false
    add_index :license_usages, %i[license_id is_uat]
  end
end
