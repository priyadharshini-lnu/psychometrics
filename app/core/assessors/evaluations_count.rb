# frozen_string_literal: true

module Assessors
  class EvaluationsCount < BaseCommand
    private_attr_reader :user_ids, :campaign

    def initialize(user_ids, campaign)
      @user_ids = user_ids
      @campaign = campaign
    end

    def call
      result = UserAssessment.
               where(
                 campaign_id: campaign.id, relationship: Relationship.assessor_relationship,
                 evaluator_id: user_ids
               ).
               group(:evaluator_id).
               select('evaluator_id, array_agg(status) as statuses').
               each_with_object({}) do |ua, acc|
        acc[ua.evaluator_id] ||= {}
        acc[ua.evaluator_id][:total] = ua.statuses.length
        acc[ua.evaluator_id][:completed] = ua.statuses.count do |status|
          status == UserAssessment.statuses[:completed]
        end
      end

      broadcast :ok, result
    end
  end
end
