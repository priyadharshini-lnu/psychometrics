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

  private

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

  def check_threesixty_user_report
    UserReportPolicy.new({ current_user: @current_user }, @record).send(:check_user_report)
  end
end
