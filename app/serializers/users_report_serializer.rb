class UsersReportSerializer < ActiveModel::Serializer
  attributes :id, :status, :campaign_id, :pdf, :is_self, :results, :approval_status, :campaign

  has_one :user, serializer: UserSerializer
  has_one :report, serializer: ReportSerializer

  def campaign_id
    object.campaign.threesixty_campaign.id
  end

  def is_self
    object.user_id == current_user.id
  end

  def approval_status
    object.threesixty_subject&.report_approval_status
  end

  def campaign
    instance_options[:campaign_details] || {}
  end

  def results
    @results ||= instance_options[:results]
  end

  private

  def report
    @report ||= instance_options[:report]
  end

end
