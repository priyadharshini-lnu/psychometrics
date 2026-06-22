# frozen_string_literal: true

module AI
  class ScoringApprovalSetting < ApplicationRecord
    self.table_name = 'ai_scoring_approval_settings'
    belongs_to :assessment
    belongs_to :campaign
    include Tenantable

    enum :digest_frequency, { daily: 'daily', weekly: 'weekly', weekdays: 'weekdays' }
    enum :digest_delivery_mode, { immediate: 'immediate', scheduled: 'scheduled' }, prefix: :digest_delivery

    before_save :set_digest_emails_enabled_at, if: :will_save_change_to_send_digest_emails?
    after_commit :trigger_cleanup_email, if: :digest_delivery_mode_or_enabled_changed?

    scope :for_user, lambda { |user_id|
      where(
        'assessor_ids @> :user_id OR approver_ids @> :user_id OR approval_notification_user_ids @> :user_id',
        user_id: "{#{user_id}}"
      )
    }

    def one_level_approve?
      allow_one_level_approve?
    end

    def self.scoring_approvals(user)
      geo_filtered_scope = AI::ScoreApproval.geo_scoped(Current.user_country)
      scope = geo_filtered_scope.joins(
        %(
          join ai_scoring_approval_settings on user_assessments.campaign_id = ai_scoring_approval_settings.campaign_id
          AND user_assessments.assessment_id = ai_scoring_approval_settings.assessment_id
        )
      ).joins(:users_result).where(users_result: { ai_scoring_status: :completed })

      return scope if user.is?(:superadmin)

      scope.merge(AI::ScoringApprovalSetting.for_user(user.id))
    end

    def self.user_tasks(user)
      scoring_approvals(user).where(
        %{
          (assessor_ids @> :user_id AND approval_status = 'pending') OR
          (approver_ids @> :user_id AND approval_status = 'assessor_approved') OR
          (allow_one_level_approve = true AND approver_ids @> :user_id AND approval_status = 'pending')
        },
        user_id: "{#{user.id}}"
      )
    end

    def self.approved_for(user)
      scoring_approvals(user).where(
        %{
          (assessor_ids @> :user_id AND approval_status = 'assessor_approved') OR
          (approver_ids @> :user_id AND approval_status = 'approver_approved') OR
          (allow_one_level_approve = true AND approver_ids @> :user_id AND approval_status = 'approver_approved')
        },
        user_id: "{#{user.id}}"
      )
    end

    private

    def digest_delivery_mode_or_enabled_changed?
      saved_change_to_digest_delivery_mode? || saved_change_to_send_digest_emails?
    end

    def trigger_cleanup_email
      if (saved_change_to_digest_delivery_mode? && digest_delivery_mode_previously_was == 'scheduled') ||
         (saved_change_to_send_digest_emails? && send_digest_emails_previously_was == true && !send_digest_emails)
        ::ScoreApprovals::DigestEmailSender.send_for(self)
      end
    end

    def set_digest_emails_enabled_at
      if send_digest_emails_changed?(from: false, to: true)
        self.digest_emails_enabled_at = Time.current
      end
    end
  end
end
