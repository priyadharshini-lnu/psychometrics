# frozen_string_literal: true

module Api
  module Administration
    module Campaigns
      class CampaignIdpPolicy < ::Administration::UserPolicy
        def index?
          has_permission?(:campaigns, :manage_users)
        end

        def create?
          has_permission?(:campaign, :manage_users)
        end

        def update?
          has_permission?(:campaign, :manage_users)
        end

        class Scope < Administration::BasePolicy::Scope
          def resolve
            scope.where(campaign_id: campaign_id)
          end
        end
      end
    end
  end
end
