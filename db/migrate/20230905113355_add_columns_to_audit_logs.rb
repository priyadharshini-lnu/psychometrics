# frozen_string_literal: true

class AddColumnsToAuditLogs < ActiveRecord::Migration[7.0]
  def change
    add_column :audit_logs, :user_agent, :string
    add_column :audit_logs, :interface, :integer
    add_column :audit_logs, :client_ip, :string
  end
end
