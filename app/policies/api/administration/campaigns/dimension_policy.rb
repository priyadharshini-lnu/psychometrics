# frozen_string_literal: true

module Api
  module Administration
    module Campaigns
      class DimensionPolicy < ::Administration::DimensionPolicy
        def assessor_dimensions?
          has_permission?(:campaign_factors, :manage)
        end

        def factors?
          has_permission?(:campaign_factors, :manage)
        end

        class Scope < BasePolicy::Scope
          def resolve(assessment_ids = [])
            if @user.has_permission?(:campaign_factors, :manage, campaign_id: campaign_id)
              scope.joins(:assessments).where(
                assessments: { id: assessment_ids }
              ).distinct
            else
              scope.none
            end
          end
        end
      end
    end
  end
end
