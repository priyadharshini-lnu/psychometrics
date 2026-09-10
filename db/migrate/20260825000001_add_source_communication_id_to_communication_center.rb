# frozen_string_literal: true

class AddSourceCommunicationIdToCommunicationCenter < ActiveRecord::Migration[7.2]
  def change
    add_column :communication_templates, :source_communication_id, :bigint, null: true
    add_column :communication_deliveries, :source_communication_id, :bigint, null: true

    add_index :communication_templates, :source_communication_id,
              name: 'idx_comm_templates_on_source_communication_id'
    add_index :communication_deliveries, :source_communication_id,
              name: 'idx_comm_deliveries_on_source_communication_id'
  end
end
