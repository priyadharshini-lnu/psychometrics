# frozen_string_literal: true

module Assessors
  class WorkshopAssessorsCount < BaseCommand
    private_attr_reader :user_ids, :campaign

    def initialize(user_ids, campaign)
      @user_ids = user_ids
      @campaign = campaign
    end

    def call
      result = WorkshopAssessor.
               joins(:workshop).
               where(user_id: user_ids, workshops: { campaign_id: campaign.id }).
               group(:user_id).
               count

      broadcast :ok, result
    end
  end
end
