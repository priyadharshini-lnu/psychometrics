# frozen_string_literal: true

module Api
  module Administration
    module AI
      class AssistantPolicy < Administration::BasePolicy
        def index?
          @user.is?(:superadmin)
        end

        def create?
          @user.is?(:superadmin)
        end

        def update?
          @user.is?(:superadmin)
        end

        def destroy?
          @user.is?(:superadmin)
        end

        def show?
          @user.is?(:superadmin)
        end

        def generate?
          @user.is?(:superadmin)
        end

        def revisions?
          @user.is?(:superadmin)
        end

        class Scope < Scope
          def resolve
            return scope if @user.is?(:superadmin)

            scope.none
          end
        end
      end
    end
  end
end
