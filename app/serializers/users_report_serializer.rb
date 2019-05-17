class UsersReportSerializer < ActiveModel::Serializer
  attributes :id, :status, :campaign_id, :pdf, :is_self, :results

  has_one :user, serializer: UserSerializer
  has_one :report, serializer: ReportSerializer

  def campaign_id
    object.campaign.threesixty_campaign.id
  end

  def is_self
    object.user_id == current_user.id
  end

  def results
    @results ||= instance_options[:results]
  end

  private

  def report
    @report ||= instance_options[:report]
  end

end
