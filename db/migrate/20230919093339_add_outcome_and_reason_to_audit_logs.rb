# frozen_string_literal: true

class AddOutcomeAndReasonToAuditLogs < ActiveRecord::Migration[7.0]
  def change
    change_table :audit_logs, bulk: true do |t|
      t.integer :outcome
      t.string :reason
    end
  end
end
