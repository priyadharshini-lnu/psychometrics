# frozen_string_literal: true

class EndUser::DirectReporteePolicy < BasePolicy
  def index?
    @current_user.project == @current_project
  end
end
