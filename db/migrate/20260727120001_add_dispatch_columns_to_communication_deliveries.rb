# frozen_string_literal: true

class AddDispatchColumnsToCommunicationDeliveries < ActiveRecord::Migration[7.1]
  def change
    change_table :communication_deliveries, bulk: true do |t|
      t.bigint :campaign_id
      t.datetime :stop_reminder_datetime
      t.datetime :last_ran_at
      t.datetime :next_run_at
    end

    # Backfill from the template's campaign — safety net only; this branch has no dispatched
    # production data yet, so this just covers any pre-existing dev/CI scaffolding rows.
    reversible do |dir|
      dir.up do
        execute <<~SQL.squish
          UPDATE communication_deliveries cd
          SET campaign_id = ct.campaign_id
          FROM communication_templates ct
          WHERE ct.id = cd.communication_template_id AND ct.campaign_id IS NOT NULL AND cd.campaign_id IS NULL
        SQL
      end
    end

    change_column_null :communication_deliveries, :campaign_id, false
    add_foreign_key :communication_deliveries, :campaigns
    add_index :communication_deliveries, :campaign_id
    add_index :communication_deliveries, :next_run_at
  end
end
