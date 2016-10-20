module Managers
  class AssignPolicy < Administration::BasePolicy
    def initialize(context, record)
      @user   = context.user
      @client = context.client
      @record = record
    end

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
