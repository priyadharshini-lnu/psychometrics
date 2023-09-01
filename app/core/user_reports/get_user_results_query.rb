# frozen_string_literal: true

module UserReports
  class GetUserResultsQuery < Rectify::Query
    private_attr_reader :user_report

    def initialize(user_report)
      @user_report = user_report
    end

    def query
      user_assessments = UserAssessment.where(
        assessment_id: user_report.report.assessment_ids,
        subject_id: user_report.user_id,
        # Disabling this condition for the assessor form to work in the report
        # evaluator_id: user_report.user_id,
        status: :completed
      ).order(completed_at: :desc).each_with_object({}) do |ua, hash|
        next if campaign_user_assessment_ids.include?(ua.assessment_id) && ua.campaign_id != user_report.campaign_id

        next hash[ua.assessment_id] = ua unless hash[ua.assessment_id]

        next hash[ua.assessment_id] = ua if ua.campaign_id == user_report.campaign_id
      end.values

      UsersResult.where(id: user_assessments.map(&:users_result_id))
    end

    private

    def campaign_user_assessment_ids
      UserAssessment.where(
        campaign_id: user_report.campaign_id,
        subject_id: user_report.user_id,
        evaluator_id: user_report.user_id
      ).pluck(:assessment_id)
    end
  end
end
