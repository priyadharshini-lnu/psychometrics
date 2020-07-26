# frozen_string_literal: true

class CalculateAgileScoring < ActiveRecord::Migration[5.1]
  def change
    Assessment.includes(:assigns).with_category('agile').find_each do |assessment|
      assessment.assigns.each { |assign| Assigns::CalculateAgileScoring.call!(assign) }
    end
  end
end
