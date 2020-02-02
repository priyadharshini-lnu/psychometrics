# frozen_string_literal: true

class AddMinRequiredResponsesToReportFilters < ActiveRecord::Migration[5.1]
  def change
    add_column :reports_filters, :min_required_responses, :integer, default: 0
  end
end
