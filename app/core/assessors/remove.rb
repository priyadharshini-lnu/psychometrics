# frozen_string_literal: true

module Assessors
  class Remove < BaseCommand
    private_attr_reader :assessor

    def initialize(assessor)
      @assessor = assessor
    end

    def call
      Assessor.transaction do
        assessor.user_assessments.where(campaign_id: assessor.campaign_id).find_each(&:destroy!)
        WorkshopAssessor.joins(:workshop).where(user_id: assessor.user_id,
                                                workshops: { campaign_id: assessor.campaign_id }).find_each(&:destroy!)
        assessor.destroy!
      end

      broadcast :ok
    end
  end
end
