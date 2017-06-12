class ChangeLicenseUsagesColumConstraint < ActiveRecord::Migration[5.0]
  def change
    change_column_null(:license_usages, :assigns_report_id, true)
  end
end
