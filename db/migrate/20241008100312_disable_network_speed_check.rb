# frozen_string_literal: true

class DisableNetworkSpeedCheck < ActiveRecord::Migration[7.1]
  def change
    ActiveRecord::Migration[7.1].execute sql
  end

  def sql
    <<-SQL.squish
      UPDATE assessments
      SET extra = jsonb_set(extra, array['enable_network_check'], to_jsonb(false), false)
      WHERE extra->'enable_network_check' = 'true'
    SQL
  end
end
