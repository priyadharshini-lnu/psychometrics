# frozen_string_literal: true

module Assessors
  class BulkSubjectEvaluationsCount < BaseCommand
    private_attr_reader :subject_user_ids, :assessor_user, :campaign_ids, :assessment_category

    def initialize(subject_user_ids, assessor_user, campaign_ids, assessment_category: :assessor_form)
      @subject_user_ids = subject_user_ids
      @assessor_user = assessor_user
      @campaign_ids = campaign_ids
      @assessment_category = assessment_category
    end

    def call
      result = get_user_assessments.
               group(:campaign_id, :subject_id).
               select('campaign_id, subject_id, array_agg(user_assessments.status) as statuses').
               each_with_object({}) do |ua, acc|
        acc[ua.campaign_id] ||= {}
        acc[ua.campaign_id][ua.subject_id] = parse_statuses(ua.statuses)
      end

      broadcast :ok, result
    end

    private

    def get_user_assessments
      UserAssessment.joins(:assessment).where(
        campaign_id: campaign_ids,
        relationship: Relationship.assessor_relationship,
        subject_id: subject_user_ids,
        evaluator: assessor_user,
        assessments: { category: assessment_category }
      )
    end

    def parse_statuses(raw_statuses)
      default = UserAssessment.statuses_count
      status_counts = raw_statuses.compact.group_by { |s| s }.each_with_object({}) do |(k, v), hash|
        status = UserAssessment.statuses.key(k).to_sym
        hash[status] = v.count
      end
      default.merge(status_counts).merge(total: raw_statuses.length)
    end
  end
end
