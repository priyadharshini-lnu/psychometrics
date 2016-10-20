module Managers
  class UserPolicy < Administration::BasePolicy
    def initialize(context, record)
      @user   = context.user
      @client = context.client
      @record = record
    end

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