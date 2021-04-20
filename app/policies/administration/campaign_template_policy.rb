# frozen_string_literal: true

module Administration
  class CampaignTemplatePolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin)
    end

    def edit?
      @user.is?(:superadmin)
    end

    def destroy?
      @user.is?(:superadmin)
    end

    def new?
      @user.is?(:superadmin)
    end

    def create?
      new?
    end
  end
end
