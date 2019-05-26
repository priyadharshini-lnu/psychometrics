class UsersReportSerializer < ActiveModel::Serializer
  attributes :id, :status, :campaign_id, :pdf, :is_self, :results, :approval_status

  has_one :user, serializer: UserSerializer
  has_one :report, serializer: ReportSerializer
  has_one :options, serializer: CampaignOptionsSerializer

  def campaign_id
    object.campaign.threesixty_campaign.id
  end

  def is_self
    object.user_id == current_user.id
  end

  def approval_status
    object.threesixty_subject&.report_approval_status
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
