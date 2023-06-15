# frozen_string_literal: true

module Administration::Threesixty
  class BasePolicy < Administration::BasePolicy
    attr_reader :threesixty_campaign, :user, :project_id, :campaign_id

    def initialize(user, record, extra = {})
      @user = user
      @record = [record].flatten.last
      @threesixty_campaign = extra[:threesixty_campaign]
      @project_id = extra[:project_id]
      @campaign_id = extra[:campaign_id] || threesixty_campaign&.campaign_id
    end

    def index?
      has_permission?(:campaigns, :view)
    end

    def show?
      has_permission?(:campaigns, :view)
    end

    def create?
      has_permission?(:campaigns, :manage)
    end

    def new?
      has_permission?(:campaigns, :manage)
    end

    def update?
      has_permission?(:campaigns, :manage)
    end

    def edit?
      has_permission?(:campaigns, :manage)
    end

    def destroy?
      has_permission?(:campaigns, :manage)
    end

    def has_permission?(resource_type, permission)
      @user.has_permission?(
        resource_type, permission, project_id: project_id, campaign_id: campaign_id
      )
    end
  end
end
