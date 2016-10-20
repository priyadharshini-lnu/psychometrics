module Managers
  class UserPolicy < BasePolicy
    def index?
      @user.is? :manager
    end

    class Scope < Scope
      def resolve
        scope
      end
    end
  end
end