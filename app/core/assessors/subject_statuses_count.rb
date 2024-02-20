# frozen_string_literal: true

module Assessors
  class SubjectStatusesCount < BaseCommand
    private_attr_reader :assessor_user, :campaign_ids, :assessment_category

    def initialize(assessor_user, campaign_ids, assessment_category: :assessor_form)
      @assessor_user = assessor_user
      @campaign_ids = campaign_ids
      @assessment_category = assessment_category
    end

    def call
      result = get_user_assessments.group(:campaign_id, :subject_id).
               select('campaign_id, subject_id, array_agg(user_assessments.status) as statuses').
               index_by { |ua| [ua.campaign_id, ua.subject_id] }.
               each_with_object({}) do |(k, ua), acc|
        campaign_id = k.first
        subject_status = get_subject_status(ua.statuses)

        acc[campaign_id] ||= UserAssessment.statuses_count.except(:interrupted).merge(total: 0)
        acc[campaign_id][:total] += 1
        acc[campaign_id][subject_status] += 1
      end

      broadcast :ok, result
    end

    private

    def get_user_assessments
      UserAssessment.joins(:assessment).where(
        relationship: Relationship.assessor_relationship,
        evaluator: assessor_user, campaign_id: campaign_ids,
        assessments: { category: assessment_category }
      )
    end

    def get_subject_status(statuses)
      default_counts = UserAssessment.statuses_count
      default_counts[:total] = statuses.length

      status_counts = statuses.group_by { |s| s }.each_with_object({}) do |(k, status_list), hash|
        status = UserAssessment.statuses.key(k).to_sym
        hash[status] = status_list.count
      end

      status_counts = default_counts.merge(status_counts)
      Assessors::GetStatusFromCounts.call!(status_counts)
    end
  end
end
