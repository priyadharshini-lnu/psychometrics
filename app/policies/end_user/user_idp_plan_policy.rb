# frozen_string_literal: true

class EndUser::UserIdpPlanPolicy < BasePolicy
  def summary?
    @record == @current_user || @record.manager == @current_user
  end
end
