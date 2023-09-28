# frozen_string_literal: true

module Api
  module Administration
    class CampaignPolicy < ::Administration::CampaignPolicy
      class Scope < BasePolicy::Scope
        def resolve
          ::Administration::CampaignPolicy::Scope.new(user, Campaign).resolve
        end
      end
    end
  end
end
