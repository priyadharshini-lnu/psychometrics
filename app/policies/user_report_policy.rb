# frozen_string_literal: true

class UserReportPolicy < BasePolicy
  def show?
    check_user_report
  end

  def download?
    check_user_report
  end

  def update_status?
    manager_approves_reports? && manager? && @record.approved?
  end

  private

  def check_user_report
    # rubocop:disable Style/OpenStructUse
    can_view_report = ::Threesixty::UsersReportsQuery.
                      new(
                        @record.campaign.threesixty_campaign,
                        [OpenStruct.new(user_id: @record.user_id)],
                        @current_user
                      ).
                      query.
                      include?(@record)
    # rubocop:enable all
    return can_view_report unless @record.has_approval_workflow?

    @record.approved? && can_view_report
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
