# frozen_string_literal: true

class ModifyLicenseUsages < ActiveRecord::Migration[5.1]
  def change
    remove_column :license_usages, :deactivated_by_id, :integer
    remove_column :license_usages, :deactivated_at, :datetime
    remove_column :license_usages, :deactivated, :boolean
    add_column :license_usages, :status_updated_by_id, :integer
    add_column :license_usages, :status_updated_at, :datetime
    add_column :license_usages, :status, :integer, default: 0
  end
end
