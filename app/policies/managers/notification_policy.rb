module Managers
  class NotificationPolicy < Administration::BasePolicy
    def initialize(context, record)
      @user   = context.user
      @client = context.client
      @record = record
    end

    def index?
      @user.is? :manager
    end
  end
end
