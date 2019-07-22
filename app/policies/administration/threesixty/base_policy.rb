# frozen_string_literal: true

module Administration::Threesixty
  class BasePolicy < Administration::BasePolicy
    attr_reader :threesixty_campaign, :user

    def initialize(user, record, extra)
      @user = user
      @threesixty_campaign = extra[:threesixty_campaign]
      @record = [record].flatten.last
    end

    def index?
      super_admins_or_admins?
    end

    def show?
      super_admins_or_admins?
    end

    def create?
      super_admins_or_admins?
    end

    def new?
      super_admins_or_admins?
    end

    def update?
      super_admins_or_admins?
    end

    def edit?
      super_admins_or_admins?
    end

    def destroy?
      super_admins_or_admins?
    end

    protected

    def super_admins_or_admins?
      return true if user.is?(:superadmin)
      return true if !threesixty_campaign && user.is?(:client_admin, :project_admin)

      return true if user.is?(:client_admin) && user.client_ids.include?(threesixty_campaign.project.client.id)

      user.is?(:project_admin) && user.client_ids.include?(threesixty_campaign.project.id)
    end
  end
end
