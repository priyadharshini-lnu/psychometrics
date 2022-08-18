# frozen_string_literal: true

class AddSuitabilityIdToHoganReportSettings < ActiveRecord::Migration[5.2]
  def change
    add_column :hogan_report_settings, :hogan_suitability_id, :string
  end
end
