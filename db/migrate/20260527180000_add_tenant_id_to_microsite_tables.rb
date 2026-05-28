# frozen_string_literal: true

class AddTenantIdToMicrositeTables < ActiveRecord::Migration[8.0]
  TABLES = %i[
    microsite_assessments
    microsite_user_assessments
  ].freeze

  # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
  def up
    TABLES.each do |table|
      add_column table, :tenant_id, :bigint unless column_exists?(table, :tenant_id)
    end
  end

  def down
    TABLES.each do |table|
      remove_column table, :tenant_id if column_exists?(table, :tenant_id)
    end
  end
  # rubocop:enable CustomRubocops/AvoidActiveRecordInMigrations
end
