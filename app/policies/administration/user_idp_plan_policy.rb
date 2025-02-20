# frozen_string_literal: true

module Administration
  class UserIdpPlanPolicy < Administration::BasePolicy
    def show?
      has_permission?(:campaigns, :manage_users)
    end

    def pdf_preview?
      has_permission?(:campaigns, :manage_users)
    end

    def download?
      has_permission?(:campaigns, :manage_users)
    end
  end
end
