# frozen_string_literal: true

module Assessors
  class BasePolicy
    attr_reader :user, :record

    def initialize(user, record, extra = {})
      @user = user
      @record = [record].flatten.last
      @extra = extra
    end

    def index?
      @user.is?(:assessor) || @user.is?(:superadmin)
    end

    def show?
      @user.is?(:assessor)
    end

    def create?
      @user.is?(:assessor)
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

    def scope
      Pundit.policy_scope!(user, record.class)
    end

    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user = user
        @scope = [scope].flatten.last
      end

      def resolve
        [scope].flatten.last
      end
    end
  end
end
