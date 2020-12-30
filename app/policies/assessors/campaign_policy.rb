# frozen_string_literal: true

module Assessors
  class CampaignPolicy < BasePolicy
    def index?
      @user.is?(:assessor)
    end

    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user = user
        @scope = [scope].flatten.last
      end

      def resolve
        scope.joins(:assessors).where(assessors: { user_id: user.id })
      end
    end
  end
end
