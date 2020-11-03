# frozen_string_literal: true

module Administration
  class CampaignAssessmentPolicy < Administration::BasePolicy
    def update?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :view)
    end

    def attach_to_group?
      update?
    end
  end
end
