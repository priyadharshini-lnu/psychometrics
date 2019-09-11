# frozen_string_literal: true

module Managers
  class TaskPolicy < BasePolicy
    def index?
      @current_user.is? :manager
    end

    def new?
      @current_user.is? :manager
    end

    def create?
      @current_user.is? :manager
    end

    def change_status?
      @current_user.is? :manager
    end

    def show?
      @current_user.is? :manager
    end

    def edit?
      create?
    end

    def update?
      create?
    end

    def destroy?
      create?
    end

    class Scope < Scope
      # TODO: implement
      def resolve
        scope
      end
    end
  end
end
