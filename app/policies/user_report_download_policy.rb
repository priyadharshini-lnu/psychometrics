# frozen_string_literal: true

class UserReportDownloadPolicy < BasePolicy
  def pdf_download_link?
    return true if @current_user.is?(:superadmin)

    return true if @current_user.has_permission?(
      :results,
      :view_report,
      project_id: @record.campaign.project_id,
      campaign_id: @record.campaign_id
    )

    return true if @record.user == @current_user && @record.user_access

    return true if assessor_can_access_report?

    return false unless @record.campaign.threesixty_campaign

    check_threesixty_user_report
  end

  def assessor_can_access_report?
    return false unless @current_user.is?(:assessor)

    campaign = @record.campaign
    return false unless @current_user.assessors_campaigns.exists?(id: campaign.id)

    campaign_report = @record.campaign_report
    return false if campaign_report.nil? || !campaign_report.assessor_access?

    UserAssessment.exists?(
      campaign_id: @record.campaign_id,
      evaluator_id: @current_user.id,
      subject_id: @record.user_id,
      relationship: Relationship.assessor_relationship
    )
  end

  class Scope < BasePolicy::Scope
    def resolve
      return scope.all if user.is?(:superadmin)

      own_report_ids = scope.where(user: user, user_access: true).select(:id)
      permitted_report_ids = user.accessible_records(UserReport, 'results.view_report').select(:id)
      threesixty_report_ids = threesixty_reports_for_user.select(:id)

      scope.where(id: own_report_ids).
        or(scope.where(id: permitted_report_ids)).
        or(scope.where(id: threesixty_report_ids))
    end

    private

    def threesixty_reports_for_user
      report_ids = user_threesixty_campaigns.flat_map do |threesixty_campaign|
        managed_subjects = Threesixty::Evaluators::GetManagedSubjectsQuery.new(threesixty_campaign, user).query
        ::Threesixty::UsersReportsQuery.new(threesixty_campaign, managed_subjects, user).query.pluck(:id)
      end

      scope.where(id: report_ids)
    end

    def user_threesixty_campaigns
      campaign_ids = Threesixty::Participant.where(evaluator_id: user.id).
                     or(Threesixty::Participant.where(subject_id: user.id)).
                     select(:campaign_id)

      Threesixty::Campaign.where(campaign_id: campaign_ids)
    end
  end

  private

  def check_threesixty_user_report
    UserReportPolicy.new({ current_user: @current_user }, @record).send(:check_user_report)
  end
end
