# frozen_string_literal: true

module Api
  module V1
    module ThreesixtyCampaigns
      class UserPolicy < ::Api::Administration::BasePolicy
        def assessments?
          has_permission?(:campaigns, :manage)
        end

        def scores?
          has_permission?(:campaigns, :view) && has_permission?(:results, :scores)
        end
      end
    end
  end
end
