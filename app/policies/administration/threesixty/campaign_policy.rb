# frozen_string_literal: true

module Administration::Threesixty
  class CampaignPolicy < Administration::CampaignPolicy
    def assessments?
      super_admins_or_admins?
    end

    def factors?
      super_admins_or_admins?
    end

    def reset?
      super_admins_or_admins?
    end

    def reset_nominations?
      super_admins_or_admins?
    end

    private

    def super_admins_or_admins?
      @user.is?(:superadmin) || (@user.is?(:client_admin) && @user.has_grant?(:clients, :manage))
    end
  end
end
