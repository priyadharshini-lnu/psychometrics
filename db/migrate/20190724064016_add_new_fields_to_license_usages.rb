# frozen_string_literal: true

class AddNewFieldsToLicenseUsages < ActiveRecord::Migration[5.1]
  def change
    add_column :license_usages, :extras, :jsonb, null: false, default: {}
    add_column :license_usages, :created_at, :timestamp, null: false, default: -> { 'CURRENT_TIMESTAMP' }
    add_reference :license_usages, :campaign, foreign_key: { on_delete: :nullify }
  end
end
