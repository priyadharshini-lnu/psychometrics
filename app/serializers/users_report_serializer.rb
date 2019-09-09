# frozen_string_literal: true

class UsersReportSerializer < ActiveModel::Serializer
  attributes :id, :status, :campaign_id, :pdf, :is_self, :results, :approval_status

  attribute :campaign, if: -> { instance_options[:threesixty_campaign] }

  has_one :user, serializer: UserSerializer
  has_one :report, serializer: ReportSerializer
  has_one :options, serializer: Threesixty::CampaignOptionsSerializer

  def campaign_id
    object.campaign.threesixty_campaign.id
  end

  def is_self # rubocop:disable Naming/PredicateName
    object.user_id == current_user.id
  end

  def approval_status
    object.threesixty_subject&.report_approval_status
  end

  def campaign
    Threesixty::CampaignDetailsSerializer.new(instance_options[:threesixty_campaign], users_report: object).to_h
  end

  def results
    @results ||= instance_options[:results]
  end

  def options
    @options ||= instance_options[:options]
  end

  private

  def report
    @report ||= instance_options[:report]
  end
end
