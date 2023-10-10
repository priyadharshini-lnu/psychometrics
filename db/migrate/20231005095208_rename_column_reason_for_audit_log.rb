# frozen_string_literal: true

class RenameColumnReasonForAuditLog < ActiveRecord::Migration[7.0]
  def change
    rename_column :audit_logs, :reason, :failure_reason
  end
end
