module Managers
  class AssignPolicy < BasePolicy
    def index?
      true
    end

    class Scope < Scope
      def resolve
        @user.client.assigns
      end
    end
  end
end
