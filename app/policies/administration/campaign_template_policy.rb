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
      @user.is?(:superadmin)
    end

    class Scope < Administration::BasePolicy::Scope
      def resolve(client_id = nil)
        return scope.all if !client_id && @user.is?(:superadmin)

        scope.where(owner_id: [client_id, nil])
      end
    end
  end
end
