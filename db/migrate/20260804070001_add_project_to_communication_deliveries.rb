# frozen_string_literal: true

class AddProjectToCommunicationDeliveries < ActiveRecord::Migration[7.1]
  def change
    add_reference :communication_deliveries, :project, foreign_key: { to_table: :clients }, index: true
    change_column_null :communication_deliveries, :campaign_id, true
  end
end
