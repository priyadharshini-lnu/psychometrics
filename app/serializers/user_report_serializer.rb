# frozen_string_literal: true

class UserReportSerializer < Panko::Serializer
  attributes :id, :status, :campaign_id, :pdf, :is_self, :results, :approval_status, :evalaution_completed_for_subject,
             :report_data, :permissions, :comments, :require_approval, :campaign_factor_results,
             :module_overrides, :user_report_events, :user, :options,
             :threesixty_campaign_id, :campaign, :campaign_ai_artifact_results

  has_one :report, serializer: ReportSerializer

  def user
    ::Reports::UserSerializer.new(context: { campaign: object.campaign }).serialize(object.user)
  end

  def user_report_events
    Panko::ArraySerializer.new(
      object.user_report_events.order(created_at: :desc),
      each_serializer: UserReportEventSerializer
    ).to_a
  end

  def pdf
    {
      url: object.pdf_download_url(locale: context[:lang])
    }
  end

  def require_approval
    object.has_approval_workflow?
  end

  def comments
    Panko::ArraySerializer.new(
      object.user_report_comments.not_deleted,
      each_serializer: UserReportCommentSerializer
    ).to_a
  end

  delegate :campaign_id, to: :object

  def is_self
    object.user_id == current_user.id
  end

  def campaign
    return unless context[:threesixty_campaign]

    Threesixty::CampaignDetailsSerializer.new(
      context: {
        user_report: object
      }
    ).serialize(context[:threesixty_campaign])
  end

  def threesixty_campaign_id
    object.threesixty_campaign&.id
  end

  def results
    context[:results]
  end

  def campaign_factor_results
    object.campaign.campaign_factor_values.where(
      user_id: object.user_id, campaign_factors: { public_visibility: true }
    ).includes(:campaign_factor).map do |cfv|
      {
        code: cfv.campaign_factor.code,
        value: cfv.value,
        name: cfv.campaign_factor.name,
        description: cfv.campaign_factor.description
      }
    end
  end

  def campaign_ai_artifact_results
    results = Campaigns::AIArtifactResultsQuery.new(
      object.campaign_id, object.user_id
    ).query

    Panko::ArraySerializer.new(
      results,
      each_serializer: AI::CampaignArtifactResultSerializer
    ).to_a
  end

  def report_data
    UserReports::PrepareUserReportData.call!(object, view_report_as)
  end

  def options
    return unless context[:options]

    Threesixty::CampaignOptionsSerializer.new(
      context: {
        current_user: current_user
      }
    ).serialize(context[:options])
  end

  def evalaution_completed_for_subject
    object.threesixty_subject&.evaluation_status_completed?
  end

  def module_overrides
    Panko::ArraySerializer.new(
      TextModuleOverride.where(user_report_id: object.id),
      each_serializer: TextModuleOverrideSerializer
    ).to_a
  end

  def permissions
    GetPermissionsHash.call!(
      Administration::UserReportPolicy,
      current_user,
      object,
      %w[
        download
        start_qc
        abort_qc
        edit_qc
        one_level_qc
        approvers_can_edit
        manage_approval
        mark_ready
        translate
      ],
      {
        project_id: object.campaign.project_id,
        campaign_id: object.campaign_id
      }
    ).merge(can_mark_ready: object.can_mark_ready?)
  end

  private

  def view_report_as
    context[:view_report_as]
  end

  def report
    ReportSerializer.new(
      context: {
        module_overrides: TextModuleOverride.where(user_report_id: object.id),
        user_results: results,
        piped_text_context: context[:options],
        campaign: object.campaign,
        lang: context[:lang],
        campaign_user: context[:campaign_user]
      }
    ).serialize(context[:report])
  end

  def current_user
    context[:current_user]
  end
end
