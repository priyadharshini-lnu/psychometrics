# frozen_string_literal: true

module Api
  module Administration
    module Campaigns
      class UserPolicy < ::Administration::UserPolicy
        def index?
          has_permission?(:workshops, :manage) || has_permission?(:campaigns, :manage_users)
        end

        def show?
          campaign = Campaign.find(campaign_id)
          lead_assessor = ::Users::GetLeadAssessor.call!(campaign, record)
          @user.id == lead_assessor&.id ||
            has_permission?(:projects, :manage_users)
        end

        def assessors_scores?
          campaign = Campaign.find(campaign_id)
          lead_assessor = ::Users::GetLeadAssessor.call!(campaign, record)

          @user.is?(:superadmin) || @user.id == lead_assessor&.id
        end

        class Scope < Administration::BasePolicy::Scope
          def resolve
            scope.with_campaign_user(campaign_id)
          end
        end
      end
    end
  end
end
