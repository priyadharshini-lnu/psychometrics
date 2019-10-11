# frozen_string_literal: true

class UsersReportPolicy < BasePolicy
  def show?
    ::Threesixty::UsersReportsQuery.
      new(
        @record.campaign.threesixty_campaign,
        [OpenStruct.new(user_id: @record.user_id)],
        @current_user
      ).
      query.
      include?(@record)
  end
end
