# frozen_string_literal: true

module Administration::Threesixty
  class CampaignPolicy < Administration::Threesixty::BasePolicy
    def show?
      super_admins_or_admins?
    end

    def index?
      super_admins_or_admins?
    end

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

    def export_completion_status?
      super_admins_or_admins?
    end

    def remove_user?
      super_admins_or_admins?
    end
  end
end
