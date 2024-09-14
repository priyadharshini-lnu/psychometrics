# frozen_string_literal: true

module Api
  module Administration
    class SkillPolicy < Administration::BasePolicy
      def index?
        @user.is?(:superadmin)
      end

      class Scope < BasePolicy::Scope
        def resolve
          return scope if @user.superadmin?
        end
      end
    end
  end
end
