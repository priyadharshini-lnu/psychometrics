# frozen_string_literal: true

require_relative '20260408120000_add_tenant_id_columns'
require_relative '20260514200000_add_tenant_id_to_audits_and_translations'
class AddTenantIdIndexesAndForeignKeys < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def up
    tenant_tables.each do |table|
      add_index table, :tenant_id, algorithm: :concurrently unless index_exists?(table, :tenant_id)
      unless foreign_key_exists?(table, column: :tenant_id)
        add_foreign_key table, :clients, column: :tenant_id, validate: false, on_delete: :nullify
      end
      validate_foreign_key table, :clients, column: :tenant_id if foreign_key_exists?(table, column: :tenant_id)
    end
  end

  def down
    tenant_tables.each do |table|
      remove_foreign_key table, :clients, column: :tenant_id if foreign_key_exists?(table, column: :tenant_id)
      remove_index table, :tenant_id, algorithm: :concurrently if index_exists?(table, :tenant_id)
    end
  end

  private

  def tenant_tables
    (::AddTenantIdColumns::TABLES + ::AddTenantIdToAuditsAndTranslations::TABLES).uniq
  end
end
