# frozen_string_literal: true

class UsersReportPolicy < BasePolicy
  def show?
    check_user_report
  end

  def download?
    check_user_report
  end

  def update_status?
    manager_approves_reports? && manager?
  end

  private

  def check_user_report
    ::Threesixty::UsersReportsQuery.
      new(
        @record.campaign.threesixty_campaign,
        [OpenStruct.new(user_id: @record.user_id)],
        @current_user
      ).
      query.
      include?(@record)
  end

  def manager_approves_reports?
    option.reports.dig('approval', 'manager_approves_reports')
  end

  def option
    @option ||= @record.campaign.threesixty_campaign.option
  end

  def manager?
    Threesixty::Subjects::GetManagers.new(subject: @record).query.exists?(user_id: @current_user.id)
  end
end
