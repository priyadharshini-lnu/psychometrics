# frozen_string_literal: true

class CalculateAgileScoring < ActiveRecord::Migration[5.1]
  def change
    Assign.agile.complete.find_each do |assign|
      norm_id = assign.agile&.config&.dig('normId')
      assign.update_column(:norm_data, { id: norm_id, type: 'agile' }) if norm_id
    end

    Assessment.includes(:assigns).with_category('agile').find_each do |assessment|
      assessment.assigns.each { |assign| Assigns::CalculateAgileScoring.call!(assign) }
    end
  end
end
