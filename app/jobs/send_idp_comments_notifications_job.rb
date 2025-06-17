# frozen_string_literal: true

class SendIdpCommentsNotificationsJob < ApplicationJob
  track_job_run

  def perform
    campaigns_with_recent_activity.find_each do |campaign|
      process_campaign_idp_comment_notifications(campaign)
    end
  end

  private

  def campaigns_with_recent_activity
    Campaign.joins(user_idp_plans: :user_idp_comments).
      where(
        user_idp_plans: { active: true },
        user_idp_comments: { created_at: recent_comment_timeframe }
      ).
      distinct
  end

  def process_campaign_idp_comment_notifications(campaign)
    send_user_notifications(campaign)
    send_manager_notifications(campaign)
  end

  def send_user_notifications(campaign)
    users_to_notify = Idp::Queries::UsersWithUnreadCommentsQuery.new(campaign, recent_comment_timeframe).query

    users_to_notify.find_in_batches do |user_batch|
      user_batch.each do |user|
        send_notification_to_user(user, campaign)
      end
    end
  end

  def send_manager_notifications(campaign)
    managers_to_notify = Idp::Queries::ManagersWithUnreadCommentsQuery.new(campaign, recent_comment_timeframe).query

    managers_to_notify.find_in_batches do |manager_batch|
      manager_batch.each do |manager|
        send_notification_to_manager(manager, campaign)
      end
    end
  end

  def recent_comment_timeframe
    last_job_started_at...current_started_at
  end

  def send_notification_to_user(user, campaign)
    Idp::CommentNotificationMailer.
      user_unread_comments(user.id, campaign.id).
      deliver_later

    EventDelivery.create!(
      event_type: :user_idp_unread_comments,
      resource: user,
      delivery_type: :email,
      sent_at: Time.zone.now,
      meta: {
        campaign_id: campaign.id,
        user_idp_plan_id: user.active_user_idp_plan.id
      }
    )
  end

  def send_notification_to_manager(manager, campaign)
    Idp::CommentNotificationMailer.
      manager_unread_comments(manager.id, campaign.id).
      deliver_later

    EventDelivery.create!(
      event_type: :user_idp_unread_comments,
      resource: manager,
      delivery_type: :email,
      sent_at: Time.zone.now,
      meta: {
        campaign_id: campaign.id
      }
    )
  end
end
