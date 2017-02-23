class ChangeLicenseUsage < ActiveRecord::Migration[5.0]
  def change
    remove_reference :license_usages, :licenseable, polymorphic: true
    add_reference :license_usages, :assigns_report, null: false
    add_reference :license_usages, :client, null: false
  end
end
