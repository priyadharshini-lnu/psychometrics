# frozen_string_literal: true

class AddClientAndImpersonatorToSessions < ActiveRecord::Migration[8.0]
  def change
    change_table :sessions, bulk: true do |t|
      t.references :impersonator, foreign_key: { to_table: :users }, type: :bigint
      t.index %i[user_id tenant_id impersonator_id], name: 'idx_sessions_user_tenant_impersonator'
    end
  end
end
