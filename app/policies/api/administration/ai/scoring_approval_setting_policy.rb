# frozen_string_literal: true

module Api
  module Administration
    module AI
      class ScoringApprovalSettingPolicy < BasePolicy
        def index?
          can_manage_ai_scoring_approval?
        end

        def show?
          can_manage_ai_scoring_approval?
        end

        def create?
          can_manage_ai_scoring_approval?
        end

        def update?
          can_manage_ai_scoring_approval?
        end

        def destroy?
          can_manage_ai_scoring_approval?
        end

        private

        def can_manage_ai_scoring_approval?
          has_permission?(:campaigns, :manage_ai_scoring_approval_settings)
        end
      end
    end
  end
end
