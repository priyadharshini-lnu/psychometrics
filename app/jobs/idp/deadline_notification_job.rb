# frozen_string_literal: true

module Idp
  class DeadlineNotificationJob < ApplicationJob
    queue_as :cron_tasks

    def perform
      notify_missed_idp_deadlines
      notify_missed_development_action_deadlines
    end

    private

    def notify_missed_idp_deadlines
      UserIdpPlan.active.approved.includes(:user, :campaign).find_each do |plan|
        next unless plan.end_date? && plan.end_date < Time.zone.today

        send_legacy_idp_deadline_notification(plan) unless legacy_notification_sent?(plan, :idp_deadline_missed)
        unless delivery_notification_sent?(plan, 'idp_deadline_missed')
          send_delivery_idp_deadline_notification(plan)
        end
      end
    end

    def notify_missed_development_action_deadlines
      UserIdpDevelopmentAction.includes(user_idp_plan: %i[user campaign]).
        where('end_date_time < ? AND progress < 100', Time.zone.now).
        find_each do |action|
        unless legacy_notification_sent?(action, :development_action_deadline_missed)
          send_legacy_development_action_notification(action)
        end
        unless delivery_notification_sent?(action, 'development_action_deadline_missed')
          send_delivery_development_action_notification(action)
        end
      end
    end

    def legacy_notification_sent?(resource, kind)
      resource.communication_emails.joins(:communication).exists?(communications: { kind: kind })
    end

    def delivery_notification_sent?(resource, kind)
      resource.communication_emails.joins(communication_delivery: :communication_template).
        exists?(communication_templates: { kind: kind })
    end

    def send_legacy_idp_deadline_notification(plan)
      communication = Communication.order(:created_at).
                      where(kind: :idp_deadline_missed, campaign_id: plan.campaign_id).
                      last
      return unless communication

      communication.create_communication_email_with_resources(
        { user: plan.user, campaign_user: plan.campaign_user },
        plan
      )
    end

    def send_delivery_idp_deadline_notification(plan)
      delivery = CommunicationDelivery.active_for_kind(
        'idp_deadline_missed', campaign_id: plan.campaign_id, project_id: plan.campaign.project_id
      )
      return unless delivery

      CommunicationEmail.create_with_resources(
        { communication_delivery_id: delivery.id, user: plan.user, campaign_user: plan.campaign_user }, plan
      )
    end

    def send_legacy_development_action_notification(action)
      communication = Communication.order(:created_at).
                      where(kind: :development_action_deadline_missed,
                            campaign_id: action.user_idp_plan.campaign_id).
                      last
      return unless communication

      communication.create_communication_email_with_resources(
        { user: action.user_idp_plan.user,
          campaign_user: action.user_idp_plan.campaign_user },
        action
      )
    end

    def send_delivery_development_action_notification(action)
      plan = action.user_idp_plan
      delivery = CommunicationDelivery.active_for_kind(
        'development_action_deadline_missed', campaign_id: plan.campaign_id, project_id: plan.campaign.project_id
      )
      return unless delivery

      CommunicationEmail.create_with_resources(
        { communication_delivery_id: delivery.id, user: plan.user, campaign_user: plan.campaign_user }, action
      )
    end
  end
end
