# frozen_string_literal: true

module UserReports
  class GetUserResultsQuery < Rectify::Query
    private_attr_reader :user_report

    def initialize(user_report)
      @user_report = user_report
    end

    def query
      user_results = UsersResult.joins(:user_assessment).where(
        user_assessments: {
          assessment_id: user_report.report.assessment_ids,
          subject_id: user_report.user_id,
          evaluator_id: user_report.user_id
        },
        status: :completed
      ).order(completed_at: :desc).each_with_object({}) do |ur, hash|
        next if campaign_user_assessment_ids.include?(ur.assessment_id) && ur.campaign_id != user_report.campaign_id

        next hash[ur.assessment_id] = ur unless hash[ur.assessment_id]

        next hash[ur.assessment_id] = ur if ur.campaign_id == user_report.campaign_id
      end.values

      UsersResult.where(id: user_results.map(&:id))
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
