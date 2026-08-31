# frozen_string_literal: true

class AddStatusFieldsToCommunicationEmails < ActiveRecord::Migration[7.1]
  def change
    change_table :communication_emails, bulk: true do |t|
      t.integer :status, null: false, default: 0
      t.string :error_code
      t.text :error_message
      t.integer :attempts, null: false, default: 0
      t.string :occurrence_key
    end

    add_index :communication_emails, :status
    add_index :communication_emails, %i[communication_delivery_id user_id occurrence_key],
              unique: true, where: 'communication_delivery_id IS NOT NULL',
              name: :idx_comm_emails_delivery_user_occurrence_uniq
  end
end
