# frozen_string_literal: true

class AddFieldsToAuditLogs < ActiveRecord::Migration[5.2]
  def change
    add_column :audit_logs, :campaign_id, :integer
    add_column :audit_logs, :project_id, :integer
    add_column :audit_logs, :client_id, :integer
  end
end
