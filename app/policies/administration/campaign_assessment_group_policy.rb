# frozen_string_literal: true

module Administration
  class CampaignAssessmentGroupPolicy < Administration::BasePolicy
    def create?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :view)
    end

    def index?
      create?
    end

    def update?
      create?
    end
  end
end
