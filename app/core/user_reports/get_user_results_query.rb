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
      user_assessments = fetch_user_assessments(assessment_ids)

      user_assessments = user_assessments.scored unless user_report.external_report?

      if view_report_as == :lead_assessor
        user_assessments = include_lead_assessor_form(user_assessments, assessment_ids)
      end

      user_assessments = filter_campaign_user_assessments(user_assessments)

      UsersResult.where(id: user_assessments.map(&:users_result_id))
    end

    private

    def fetch_user_assessments(assessment_ids)
      UserAssessment.where(
        assessment_id: assessment_ids,
        subject_id: user_report.user_id,
        status: :completed
        # Disabling this condition for the assessor form to work in the report
        # evaluator_id: user_report.user_id,
      ).order(completed_at: :desc)
    end

    def include_lead_assessor_form(user_assessments, assessment_ids)
      lead_form = UserAssessments::GetLeadUserAssessmentForSubject.call!(user_report.campaign, user_report.user)
      if lead_form.present? && assessment_ids.include?(lead_form.assessment_id)
        user_assessments.or(
          UserAssessment.where(
            campaign_id: user_report.campaign_id,
            assessment_id: lead_form.assessment_id,
            status: :in_progress,
            subject_id: user_report.user_id
          )
        )
      else
        user_assessments
      end
    end

    def filter_campaign_user_assessments(user_assessments)
      user_assessments.each_with_object({}) do |ua, hash|
        next if campaign_user_assessment_ids.include?(ua.assessment_id) && ua.campaign_id != user_report.campaign_id

        next hash[ua.assessment_id] = ua unless hash[ua.assessment_id]

        next hash[ua.assessment_id] = ua if ua.campaign_id == user_report.campaign_id
      end.values
    end

    def campaign_user_assessment_ids
      UserAssessment.where(
        campaign_id: user_report.campaign_id,
        subject_id: user_report.user_id,
        evaluator_id: user_report.user_id
      ).pluck(:assessment_id)
    end
  end
end
