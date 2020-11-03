# frozen_string_literal: true

class SetAssessmentPosition < ActiveRecord::Migration[5.1]
  def change
    Campaign.includes(:campaign_assessments).find_each do |c|
      position = 1
      c.campaign_assessments.each do |ca|
        ca.update(position: position)
        position += 1
      end
    end
  end
end
