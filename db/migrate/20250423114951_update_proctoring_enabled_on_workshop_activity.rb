# frozen_string_literal: true

class UpdateProctoringEnabledOnWorkshopActivity < ActiveRecord::Migration[7.1]
  def up
    execute <<-SQL.squish
      UPDATE campaign_options
      SET proctoring_enabled_on_workshop_activity = false
      WHERE proctoring_enabled = false;
    SQL
  end
end
