# frozen_string_literal: true

class CalculateAgileScoring < ActiveRecord::Migration[5.1]
  def change
    Assign.agile.find_each do |assign|
      normId = assign.agile&.config&.dig('normId')
      assign.update_column(:norm_data, { id: normId, type: 'agile' }) if normId
    end

    Assessment.includes(:assigns).with_category('agile').find_each do |assessment|
      assessment.assigns.each { |assign| Assigns::CalculateAgileScoring.call!(assign) }
    end
  end
end
