module Managers
  class AssignPolicy < BasePolicy
    def index?
      @current_user.is? :manager
    end

    class Scope < Scope
      def resolve
        @user[:current_client].assigns
      end
    end
  end
end
