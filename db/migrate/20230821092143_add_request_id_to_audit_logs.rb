# frozen_string_literal: true

class AddRequestIdToAuditLogs < ActiveRecord::Migration[7.0]
  def change
    add_column :audit_logs, :request_uuid, :string
  end
end
