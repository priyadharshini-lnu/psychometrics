# frozen_string_literal: true

module Administration::Threesixty
  class CampaignPolicy < Administration::CampaignPolicy
    def assessments?
      @user.is?(:superadmin) || (@user.is?(:client_admin) && @user.has_grant?(:clients, :manage))
    end

    def factors?
      @user.is?(:superadmin) || (@user.is?(:client_admin) && @user.has_grant?(:clients, :manage))
    end
  end
end
