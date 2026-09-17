# frozen_string_literal: true

module WorkshopInvites
  class SendEmail < BaseCommand
    attr_reader :workshop_invited_subject, :campaign, :campaign_user, :resent

    def initialize(workshop_invited_subject, resent: false)
      @workshop_invited_subject = workshop_invited_subject
      @campaign = workshop_invited_subject.campaign
      @campaign_user = CampaignUser.find_by(
        campaign: @campaign,
        user: workshop_invited_subject.user
      )
      @resent = resent
    end

    def call
      return false if !resent && email_already_sent?
      return false if invite_no_longer_pending?
      return false if prework_not_completed?

      sent_legacy = send_legacy_invite_email
      sent_delivery = send_delivery_invite_email
      sent_legacy || sent_delivery
    end

    private

    def email_already_sent?
      workshop_invited_subject.workshop_invite.
        communication_emails.
        exists?(user_id: workshop_invited_subject.user_id)
    end

    def invite_no_longer_pending?
      workshop_invited_subject.status != 'pending'
    end

    def prework_not_completed?
      if campaign.campaign_options.workshop_invite_requires_prework_completion?
        !campaign_user&.all_prework_completed?
      else
        false
      end
    end

    def send_legacy_invite_email
      communication = campaign.
                      communications.
                      workshop_invite.
                      where(campaign_assessment_group_id: workshop_invite.campaign_assessment_group_id).last
      return false unless communication

      communication.emails.create(
        campaign_user: campaign_user,
        workshop_invite: workshop_invited_subject.workshop_invite
      )
    end

    def send_delivery_invite_email
      delivery = CommunicationDelivery.active_for_campaign_assessment_group(
        'workshop_invite', campaign_id: campaign.id,
        campaign_assessment_group_id: workshop_invite.campaign_assessment_group_id
      )
      return false unless delivery

      CommunicationEmail.create!(
        communication_delivery: delivery,
        campaign_user: campaign_user,
        workshop_invite: workshop_invited_subject.workshop_invite
      )
      true
    end

    def workshop_invite
      workshop_invited_subject.workshop_invite
    end
  end
end
