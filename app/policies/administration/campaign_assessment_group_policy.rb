# frozen_string_literal: true

module Administration
  class CampaignAssessmentGroupPolicy < Administration::BasePolicy
    def index?
      has_permission?(:campaigns, :view)
    end

    def create?
      has_permission?(:campaigns, :manage)
    end

    def update?
      has_permission?(:campaigns, :manage)
    end

    def update_positions?
      update?
    end

    def fetch_name_translations?
      update?
    end
  end
end
