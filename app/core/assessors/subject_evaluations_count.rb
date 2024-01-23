# frozen_string_literal: true

module Assessors
  class SubjectEvaluationsCount < BaseCommand
    private_attr_reader :subject_user_ids, :assessor_user, :campaign_id, :assessment_category

    def initialize(subject_user_ids, assessor_user, campaign_id, assessment_category: :assessor_form)
      @subject_user_ids = subject_user_ids
      @assessor_user = assessor_user
      @campaign_id = campaign_id
      @assessment_category = assessment_category
    end

    def call
      result =
        UserAssessment.joins(:assessment).
        where(
          campaign_id: campaign_id, relationship: Relationship.assessor_relationship,
          subject_id: subject_user_ids, evaluator: assessor_user, assessments: { category: assessment_category }
        ).
        group(:subject_id).
        select('subject_id, array_agg(user_assessments.status) as statuses').
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
