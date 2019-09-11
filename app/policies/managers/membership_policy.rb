# frozen_string_literal: true

module Managers
  class MembershipPolicy < BasePolicy
    def index?
      @current_user.is? :manager
    end

    class Scope < Scope
      def resolve
        scope
      end
    end
  end
end
