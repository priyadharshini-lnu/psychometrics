# frozen_string_literal: true

module Administration
  class ParticipantPolicy < Administration::BasePolicy
    def index?
      # TODO: (atanych): check campaign_id
      return true if @user.is?(:superadmin)
      return true if @user.is?(:client_admin, :project_admin) && @user.has_grant?(:clients, :manage)

      false
    end
  end
end
