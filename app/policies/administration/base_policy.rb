# frozen_string_literal: true

module Administration
  class BasePolicy
    attr_reader :user, :project_id, :campaign_id, :record

    def initialize(user, record, extra = {})
      @user = user
      @project_id = extra[:project_id]
      @campaign_id = extra[:campaign_id]
      @record = [record].flatten.last
    end

    def index?
      @user.is?(:superadmin)
    end

    def show?
      @user.is?(:superadmin)
    end

    def create?
      @user.is?(:superadmin)
    end

    def new?
      create?
    end

    def update?
      create?
    end

    def edit?
      update?
    end

    def destroy?
      create?
    end

    def copy?
      create?
    end

    def import?
      @user.is?(:superadmin)
    end

    def export?
      @user.is?(:superadmin)
    end

    def toggle_status?
      create?
    end

    def actions?
      edit? & copy? & destroy?
    end

    def scope
      Pundit.policy_scope!(user, record.class)
    end

    def has_permission?(resource_type, permission, options = {})
      @user.has_permission?(
        resource_type,
        permission,
        project_id: options[:project_id] || project_id,
        campaign_id: options[:campaign_id] || campaign_id
      )
    end

    def client
      return nil if project_id.nil? && campaign_id.nil?
      return @client if defined?(@client)

      @client = if project_id.present?
                  Client.find_by(id: project_id)
                elsif campaign_id.present?
                  Campaign.includes(:project).find_by(id: campaign_id)&.project
                end

      @client = @client.parent unless @client&.tenancy?
    end

    class Scope
      attr_reader :user, :scope

      def initialize(user, scope, _opts = {})
        @user = user
        @scope = [scope].flatten.last
      end

      # scope - could be array [:administration, Model]
      def resolve
        [scope].flatten.last
      end
    end
  end
end
