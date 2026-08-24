# frozen_string_literal: true

module Communications
  module Deliveries
    class ResolveAudience < BaseCommand
      WORKSHOP_SEAT_LEAD_TIME_SQL = %(
        workshops.total_seats > workshops.booked_seats AND
        NOW() < (workshops.start_time - (workshops.scheduling_lead_time * '1 second'::INTERVAL) - '8 hours'::INTERVAL)
      )

      def initialize(delivery)
        @delivery = delivery
      end

      def call
        base_scope = recipients_scope
        return broadcast(:unsupported_recipients, nil) if base_scope.nil?

        broadcast(:ok, skip_rule_filter? ? base_scope : apply_rule_filter(base_scope))
      end

      private

      attr_reader :delivery

      def recipients_scope
        case delivery.kind
          when 'workshop_invite_reminder' then workshop_invite_reminder_campaign_users
          else
            case delivery.recipients
              when 'all' then active_campaign_users
              when 'selected' then active_campaign_users.where(user_id: selected_user_ids)
              when 'new_assignment' then new_assignment_campaign_users
            end
        end
      end

      def skip_rule_filter?
        %w[workshop_invite_reminder assessment_center_booking_summary].include?(delivery.kind) ||
          delivery.new_assignment_recipients?
      end

      def active_campaign_users
        delivery.campaign.campaign_users.
          joins(:user).
          where(users: { disabled: false, is_anonym: false }, active: true)
      end

      def selected_user_ids
        delivery.communication_delivery_users.select(:user_id)
      end

      def workshop_invite_reminder_campaign_users
        invite_scope = { campaign_id: delivery.campaign_id,
                         campaign_assessment_group_id: delivery.campaign_assessment_group_id }
        subject_user_ids = WorkshopInvitedSubject.pending.
                           joins(workshop_invite: :workshops).
                           where(workshop_invites: invite_scope).
                           where(WORKSHOP_SEAT_LEAD_TIME_SQL).
                           distinct.pluck(:user_id)

        active_campaign_users.where(user_id: subject_user_ids)
      end

      def new_assignment_campaign_users
        cutoff = delivery.last_ran_at || delivery.created_at
        new_evaluator_ids = UserAssessment.where(campaign_id: delivery.campaign_id).
                            where('subject_id = evaluator_id').
                            where('user_assessments.created_at > ?', cutoff).
                            distinct.pluck(:evaluator_id)

        active_campaign_users.where(user_id: new_evaluator_ids)
      end

      def apply_rule_filter(scope)
        case delivery.delivery_rule
          when 'not_started' then scope.where(completion_status: :not_started)
          when 'not_completed' then not_completed_scope(scope)
          when 'in_progress' then scope.where(completion_status: :in_progress)
          else scope
        end
      end

      def not_completed_scope(scope)
        return scope.where.not(completion_status: :completed) if delivery.selected_assessments.empty?

        scope.where.not(id: completed_campaign_user_ids)
      end

      def completed_campaign_user_ids
        assessment_ids = delivery.selected_assessment_ids

        CampaignUser.
          joins(:user_assessments).
          where(user_assessments: { assessment_id: assessment_ids, status: UserAssessment::DEEMED_COMPLETED_STATUS }).
          group(:id).
          having('COUNT(DISTINCT user_assessments.assessment_id) = ?', assessment_ids.size).
          select(:id)
      end
    end
  end
end
