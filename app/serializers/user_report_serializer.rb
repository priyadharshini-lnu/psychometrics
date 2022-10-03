# frozen_string_literal: true

class UserReportSerializer < ActiveModel::Serializer
  attributes :id, :status, :campaign_id, :pdf, :is_self, :results, :approval_status, :evalaution_completed_for_subject,
             :approved, :permissions

  attribute :campaign, if: -> { instance_options[:threesixty_campaign] }

  has_one :user, serializer: UserSerializer
  has_one :report, serializer: ReportSerializer
  has_one :options, serializer: Threesixty::CampaignOptionsSerializer
  has_many :module_overrides, each_serializer: TextModuleOverrideSerializer

  def campaign_id
    object.campaign.threesixty_campaign&.id || object.campaign_id
  end

  def is_self # rubocop:disable Naming/PredicateName
    object.user_id == current_user.id
  end

  def approval_status
    object.threesixty_subject&.report_approval_status
  end

  def campaign
    Threesixty::CampaignDetailsSerializer.new(
      instance_options[:threesixty_campaign], user_report: object
    ).to_h
  end

  def results
    @results ||= instance_options[:results]
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
      ['download'],
      {
        project_id: object.campaign.project_id,
        campaign_id: object.campaign_id
      }
    )
  end

  private

  def report
    @report ||= instance_options[:report]
  end
end
