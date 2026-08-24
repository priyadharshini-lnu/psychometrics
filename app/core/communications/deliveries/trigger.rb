# frozen_string_literal: true

module Communications
  module Deliveries
    class Trigger < BaseCommand
      def initialize(delivery)
        @delivery = delivery
      end

      TERMINAL_STATUSES = %w[completed cancelled failed].freeze

      # Dispatched externally when the underlying event fires, see UserReport#schedule_report_available_notification,
      # Communications::CompletionTypeJob, Users::SendMagicLinkLogin, UserIdpPlan#schedule_idp_assigned_notification /
      # #schedule_idp_status_notification, Idp::DeadlineNotificationJob, WorkshopInvites::SendEmail,
      # WorkshopSubject#send_workshop_booked_email / #send_workshop_cancelled_email and
      # Communications::WorkshopUpcomingReminderJob. Only one delivery of a given event-fired kind may be active per
      # scope (campaign or project) at a time -- activating a new one deactivates any prior active delivery of the
      # same kind in the same scope, see #deactivate_previous_active_siblings!.
      EVENT_FIRED_KINDS = %w[
        report_available completion magic_link_email idp_template_assigned idp_template_approved
        idp_template_rejected idp_deadline_missed development_action_deadline_missed
        workshop_invite workshop_booked workshop_cancelled workshop_upcoming_reminder
      ].freeze

      # Campaign-only kinds that additionally scope "one active delivery" by campaign_assessment_group_id, not just
      # by campaign -- legacy allows one active Communication row per kind per campaign_assessment_group (see
      # WorkshopSubject/WorkshopInvite's non-optional belongs_to :campaign_assessment_group).
      ASSESSMENT_GROUP_SCOPED_KINDS = %w[
        workshop_invite workshop_booked workshop_cancelled workshop_upcoming_reminder
      ].freeze

      def call
        return broadcast(:ok, delivery) if TERMINAL_STATUSES.include?(delivery.status)

        case delivery.kind
          when 'workshop_invite_reminder' then start_recurring!
          when 'assessment_center_booking_summary' then start_scheduled!
          when *EVENT_FIRED_KINDS
            deactivate_previous_active_siblings!
            delivery.update!(status: :active)
          else
            if delivery.new_assignment_recipients?
              start_recurring!
            elsif delivery.new_users_recipients?
              # Dispatched externally at campaign-user-invite time, see Campaigns::Users::Create.
              delivery.update!(status: :active)
            else
              case delivery.delivery_rule
                when 'send_now'
                  delivery.update!(status: :enqueued)
                  Communications::Deliveries::DispatchJob.perform_later(delivery.id)
                when 'specific_datetime'
                  delivery.update!(status: :enqueued) # TickJob picks it up once delivery_at is due
                when 'not_started', 'not_completed', 'in_progress'
                  delivery.update!(status: :active, next_run_at: Time.current)
                  Communications::Deliveries::DispatchJob.perform_later(delivery.id)
                else
                  delivery.update!(status: :failed)
              end
            end
        end
        broadcast(:ok, delivery)
      end

      private

      attr_reader :delivery

      def start_recurring!
        delivery.update!(status: :active, next_run_at: Time.current)
        Communications::Deliveries::DispatchJob.perform_later(delivery.id)
      end

      def start_scheduled!
        next_date = Communications::Deliveries::RecurringScheduling.next_scheduled_date(delivery)
        return delivery.update!(status: :failed) unless next_date

        run_at = Communications::Deliveries::RecurringScheduling.run_at_for(delivery, next_date)
        delivery.update!(status: :enqueued, next_run_at: run_at)
        Communications::Deliveries::DispatchJob.set(wait_until: run_at).perform_later(delivery.id)
      end

      def deactivate_previous_active_siblings!
        siblings = CommunicationDelivery.joins(:communication_template).
                   where(communication_templates: { kind: delivery.kind }, status: :active).
                   where.not(id: delivery.id)
        siblings = if delivery.campaign_id.present?
                     siblings.where(campaign_id: delivery.campaign_id)
                   else
                     siblings.where(project_id: delivery.project_id)
                   end
        if ASSESSMENT_GROUP_SCOPED_KINDS.include?(delivery.kind)
          siblings = siblings.where(campaign_assessment_group_id: delivery.campaign_assessment_group_id)
        end
        siblings.update_all(status: CommunicationDelivery.statuses[:cancelled], cancelled_at: Time.current)
      end
    end
  end
end
