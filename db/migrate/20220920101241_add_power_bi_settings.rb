# frozen_string_literal: true

class AddPowerBiSettings < ActiveRecord::Migration[6.1]
  def change
    create_table :power_bi_settings do |t|
      t.string :capacity_id
      t.string :workspace_id
    end

    add_reference :power_bi_settings, :project, foreign_key: { on_delete: :cascade, to_table: :clients }
  end
end
