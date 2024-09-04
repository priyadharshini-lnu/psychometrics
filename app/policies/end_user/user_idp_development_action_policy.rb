# frozen_string_literal: true

class EndUser::UserIdpDevelopmentActionPolicy < ::BasePolicy
  def index?
    @record == @current_user || @record.manager == @current_user
  end
end
