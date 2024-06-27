# frozen_string_literal: true

module UserReports
  class GetUserResultsQuery < Rectify::Query
    private_attr_reader :user_report, :view_report_as

    def initialize(user_report, view_report_as)
      @user_report = user_report
      @view_report_as = view_report_as
    end

    def query
      assessment_ids = user_report.report.assessment_ids
      user_assessments = UserAssessment.where(
        assessment_id: assessment_ids,
        subject_id: user_report.user_id,
        # Disabling this condition for the assessor form to work in the report
        # evaluator_id: user_report.user_id,
        status: :completed
      ).order(completed_at: :desc)
      if view_report_as == :lead_assessor
        lead_form = UserAssessments::GetLeadUserAssessmentForSubject.call!(user_report.campaign, user_report.user)
        if lead_form.present? && assessment_ids.include?(lead_form.assessment_id)
          user_assessments = user_assessments.or(
            UserAssessment.where(campaign_id: user_report.campaign_id, assessment_id: lead_form.assessment_id,
                                 status: :in_progress, subject_id: user_report.user_id)
          )
        end
      end

      user_assessments = user_assessments.each_with_object({}) do |ua, hash|
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
