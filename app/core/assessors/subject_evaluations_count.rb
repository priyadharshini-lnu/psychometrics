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
      bulk_result = Assessors::BulkSubjectEvaluationsCount.call!(
        subject_user_ids, assessor_user, [campaign_id], assessment_category: assessment_category
      )

      result = bulk_result[campaign_id.to_i] || {}

      broadcast :ok, result
    end
  end
end
