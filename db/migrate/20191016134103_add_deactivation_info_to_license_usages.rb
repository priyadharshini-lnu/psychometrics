# frozen_string_literal: true

class AddDeactivationInfoToLicenseUsages < ActiveRecord::Migration[5.1]
  def change
    add_column :license_usages, :deactivated_by_id, :integer
    add_column :license_usages, :deactivated_at, :datetime
    add_column :license_usages, :deactivated, :boolean, default: false
  end
end
