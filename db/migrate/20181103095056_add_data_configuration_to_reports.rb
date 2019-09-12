# frozen_string_literal: true

class AddDataConfigurationToReports < ActiveRecord::Migration[5.1]
  def change
    add_column :reports, :data_configuration, :jsonb, default: {}
  end
end
