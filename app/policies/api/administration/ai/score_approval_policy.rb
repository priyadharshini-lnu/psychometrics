# frozen_string_literal: true

module Api
  module Administration
    module AI
      class ScoreApprovalPolicy < BasePolicy
        def index?
          can_manage_score_approval?
        end

        def show?
          can_manage_score_approval?
        end

        def approve_question?
          can_manage_score_approval? # check user is approver
        end

        def override_score?
          can_manage_score_approval? # check user is approver
        end

        def discard_score?
          can_manage_score_approval? # check user is approver
        end

        def bulk_approve?
          can_manage_score_approval?
        end

        def metadata_for_filters?
          can_manage_score_approval?
        end

        class Scope < BasePolicy::Scope
          def resolve
            ::AI::ScoringApprovalSetting.scoring_approvals(user)
          end
        end

        private

        def can_manage_score_approval?
          @user.is?(:superadmin, :client_admin, :project_admin, :campaign_admin)
        end
      end
    end
  end
end
