# frozen_string_literal: true

module Api
  module Administration
    module AI
      class ScoreApprovalPolicy < BasePolicy
        def index?
          can_manage_score_approval?
        end

        def show?
          return true if @user.is?(:superadmin)
          return false unless approval_setting

          user_is_assessor? || user_is_approver?
        end

        def subject_assessment?
          show?
        end

        def approve_question?
          can_perform_approval_action?
        end

        def discard_question?
          can_perform_approval_action?
        end

        def approve_all_questions?
          can_perform_approval_action? && approval_setting&.allow_bulk_approve_scores?
        end

        def discard_all_questions?
          can_perform_approval_action? && approval_setting&.allow_bulk_approve_scores?
        end

        def override_score?
          can_perform_approval_action?
        end

        def discard_score?
          can_perform_approval_action?
        end

        def rescore?
          can_perform_approval_action?
        end

        def reset_approval?
          @user.is?(:superadmin)
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

        def can_perform_approval_action?
          return true if @user.is?(:superadmin)
          return false unless approval_setting

          if approval_setting.one_level_approve?
            user_is_approver?
          else
            return true if record.pending? && user_is_assessor?
            return true if record.assessor_approved? && user_is_approver?

            false
          end
        end

        def can_manage_score_approval?
          @user.is?(:superadmin, :client_admin, :project_admin, :campaign_admin)
        end

        def approval_setting
          @approval_setting ||= record.setting
        end

        def user_is_approver?
          approval_setting&.approver_ids&.include?(@user.id)
        end

        def user_is_assessor?
          approval_setting&.assessor_ids&.include?(@user.id)
        end

        def allowed_to_manage?
          can_manage_score_approval?
        end
      end
    end
  end
end
