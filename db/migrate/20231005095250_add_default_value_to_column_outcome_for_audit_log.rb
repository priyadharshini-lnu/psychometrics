# frozen_string_literal: true

class AddDefaultValueToColumnOutcomeForAuditLog < ActiveRecord::Migration[7.0]
  def up
    change_column :audit_logs, :outcome, :integer, default: 1
  end

  def down
    change_column :audit_logs, :outcome, :string
  end
end
