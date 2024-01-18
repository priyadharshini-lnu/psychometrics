# frozen_string_literal: true

class UserReportSerializer < ActiveModel::Serializer
  attributes :id, :status, :campaign_id, :pdf, :is_self, :results, :approval_status, :evalaution_completed_for_subject,
             :report_data, :permissions, :comments, :require_approval, :campaign_factor_results

  attribute :campaign, if: -> { instance_options[:threesixty_campaign] }

  has_one :user, method: :user
  has_one :report, serializer: ReportSerializer
  has_one :options, serializer: Threesixty::CampaignOptionsSerializer
  has_many :module_overrides, each_serializer: TextModuleOverrideSerializer
  has_many :comments, each_serializer: UserReportCommentSerializer
  has_many :user_report_events, each_serializer: UserReportEventSerializer

  def user
    UserSerializer.new.serialize(object.user)
  end

  def user_report_events
    object.user_report_events.order(created_at: :desc)
  end

  def require_approval
    object.has_approval_workflow?
  end

  def comments
    object.user_report_comments.not_deleted
  end

  def campaign_id
    object.campaign.threesixty_campaign&.id || object.campaign_id
  end

  def is_self
    object.user_id == current_user.id
  end

  def campaign
    Threesixty::CampaignDetailsSerializer.new(
      instance_options[:threesixty_campaign], user_report: object
    ).to_h
  end

  def results
    @results ||= instance_options[:results]
  end

  def campaign_factor_results
    object.campaign.campaign_factor_values.where(
      user_id: object.user_id, campaign_factors: { public_visibility: true }
    ).includes(:campaign_factor).map do |cfv|
      {
        code: cfv.campaign_factor.code,
        value: cfv.value
      }
    end
  end

  def report_data
    UserReports::PrepareUserReportData.call!(object, view_report_as)
  end

  def options
    @options ||= instance_options[:options]
  end

  def evalaution_completed_for_subject
    object.threesixty_subject&.evaluation_status_completed?
  end

  def module_overrides
    TextModuleOverride.where(user_report_id: object.id)
  end

  def permissions
    GetPermissionsHash.call!(
      Administration::UserReportPolicy,
      current_user,
      object,
      %w[
        download
        manage_qc
        manage_approval
      ],
      {
        project_id: object.campaign.project_id,
        campaign_id: object.campaign_id
      }
    )
  end

  private

  def view_report_as
    instance_options[:view_report_as]
  end

  def report
    @report ||= instance_options[:report]
  end

  def current_user
    scope
  end
end
