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
        next if plan.communication_emails.joins(:communication).
                exists?(communications: { kind: :idp_deadline_missed })

        send_idp_deadline_notification(plan)
      end
    end

    def notify_missed_development_action_deadlines
      UserIdpDevelopmentAction.includes(user_idp_plan: %i[user campaign]).
        where('end_date_time < ? AND progress < 100', Time.zone.now).
        find_each do |action|
        next if action.communication_emails.joins(:communication).
                exists?(communications: { kind: :development_action_deadline_missed })

        send_development_action_notification(action)
      end
    end

    def send_idp_deadline_notification(plan)
      communication = Communication.order(:created_at).
                      where(kind: :idp_deadline_missed, campaign_id: plan.campaign_id).
                      last
      return unless communication

      communication.create_communication_email_with_resources(
        { user: plan.user, campaign_user: plan.campaign_user },
        plan
      )
    end

    def send_development_action_notification(action)
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
  end
end
