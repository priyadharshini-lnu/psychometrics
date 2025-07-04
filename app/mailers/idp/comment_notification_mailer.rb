# frozen_string_literal: true

module Idp
  class CommentNotificationMailer < ApplicationMailer
    layout 'admin_email'

    def manager_unread_comments(user_id, campaign_id)
      @user = User.find(user_id)
      @campaign = Campaign.find(campaign_id)

      send_email(
        @user,
        subject: I18n.t('mailer.idp.manager_unread_comments.subject', campaign_name: @campaign.name),
        template_path: 'mailer/idp/comment_notification',
        template_name: 'manager_unread_comments'
      )
    end

    def user_unread_comments(user_id, campaign_id)
      @user = User.find(user_id)
      @campaign = Campaign.find(campaign_id)

      send_email(
        @user,
        subject: I18n.t('mailer.idp.user_unread_comments.subject', campaign_name: @campaign.name),
        template_path: 'mailer/idp/comment_notification',
        template_name: 'user_unread_comments'
      )
    end
  end
end
