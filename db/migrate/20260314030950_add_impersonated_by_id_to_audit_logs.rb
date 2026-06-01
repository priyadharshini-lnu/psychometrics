# frozen_string_literal: true

class AddImpersonatedByIdToAuditLogs < ActiveRecord::Migration[8.0]
  def change
    add_reference :audit_logs, :impersonated_by, foreign_key: { to_table: :users }
  end
end
