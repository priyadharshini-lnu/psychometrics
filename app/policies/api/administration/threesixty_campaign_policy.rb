# frozen_string_literal: true

module Api
  module Administration
    class ThreesixtyCampaignPolicy < Administration::BasePolicy
      def create_campaign?
        has_permission?(:campaigns, :manage)
      end
    end
  end
end
