# frozen_string_literal: true

module Assessors
  class SubjectEvaluationsCount < BaseCommand
    private_attr_reader :subject_user_ids, :assessor_user, :campaign_id

    def initialize(subject_user_ids, assessor_user, campaign_id)
      @subject_user_ids = subject_user_ids
      @assessor_user = assessor_user
      @campaign_id = campaign_id
    end

    def call
      result =
        UserAssessment.
        where(
          campaign_id: campaign_id, relationship: Relationship.assessor_relationship,
          subject_id: subject_user_ids, evaluator: assessor_user
        ).
        group(:subject_id).
        select('subject_id, array_agg(status) as statuses').
        each_with_object({}) do |ua, acc|
          acc[ua.subject_id] ||= UserAssessment.statuses_count
          acc[ua.subject_id][:total] = ua.statuses.length

          status_counts = ua.statuses.group_by { |s| s }.each_with_object({}) do |(k, v), hash|
            status = UserAssessment.statuses.key(k).to_sym
            hash[status] = v.count
          end
          acc[ua.subject_id] = acc[ua.subject_id].merge(status_counts)
        end

      broadcast :ok, result
    end
  end
end
