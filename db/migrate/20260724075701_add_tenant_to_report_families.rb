# frozen_string_literal: true

class AddTenantToReportFamilies < ActiveRecord::Migration[8.0]
  def change
    add_column :report_families, :tenant_id, :integer, null: true
    add_index :report_families, :tenant_id
    add_foreign_key :report_families, :clients, column: :tenant_id
  end
end
