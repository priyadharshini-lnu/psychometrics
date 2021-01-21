# frozen_string_literal: true

module Assessors
  class EvaluationsCount < BaseCommand
    private_attr_reader :user_ids, :campaign

    def initialize(user_ids, campaign)
      @user_ids = user_ids
      @campaign = campaign
    end

    def call
      result = UserAssessment.joins(:users_result).
               where(user_assessments: {
                 campaign_id: campaign.id, relationship: Relationship.assessor_relationship,
                 evaluator_id: user_ids
               }).
               group(:evaluator_id).
               select('user_assessments.evaluator_id, array_agg(status) as statuses').
               each_with_object({}) do |ur, acc|
        acc[ur.evaluator_id] ||= {}
        acc[ur.evaluator_id][:total] = ur.statuses.length
        acc[ur.evaluator_id][:completed] = ur.statuses.count do |status|
          status == UsersResult.statuses[:completed]
        end
      end

      broadcast :ok, result
    end
  end
end
