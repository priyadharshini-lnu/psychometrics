# frozen_string_literal: true

class WorkshopSubject < ApplicationRecord
  audited

  belongs_to :workshop
  belongs_to :user
  belongs_to :campaign
  belongs_to :workshop_invited_subject
  include Tenantable

  has_one :workshop_invite, through: :workshop_invited_subject

  enum :scheduling_status, { scheduled: 0, rescheduled: 1, cancelled: 2, late_rescheduled: 3, late_cancelled: 4 }
  enum :attendance_status, { no_status: 0, on_time: 1, late: 2, no_show: 3, dropped_out: 4 }

  after_commit :send_workshop_booked_email, on: %i[create]
  after_commit :send_workshop_cancelled_email, on: %i[update],
    if: proc { saved_change_to_scheduling_status? && %w[cancelled late_cancelled].include?(scheduling_status) }

  after_commit :publish_scheduling_scheduled_create, on: %i[create]
  after_commit :publish_scheduling_scheduled, on: %i[update],
    if: proc { saved_change_to_scheduling_status? && scheduled? }
  after_commit :publish_scheduling_cancelled, on: %i[update],
    if: proc { saved_change_to_scheduling_status? && (cancelled? || late_cancelled?) }
  after_commit :publish_scheduling_rescheduled, on: %i[update],
    if: proc { saved_change_to_scheduling_status? && (rescheduled? || late_rescheduled?) }
  after_commit :publish_workshop_attendance_status, on: %i[update],
    if: proc { saved_change_to_attendance_status? }

  scope :participatable, lambda {
    where.not(attendance_status: %i[no_show dropped_out]).
      where.not(scheduling_status: %i[rescheduled cancelled late_rescheduled late_cancelled])
  }

  scope :removeable_subjects, lambda {
    where(scheduling_status: %i[rescheduled cancelled late_rescheduled late_cancelled]).or(
      where(attendance_status: %i[no_show dropped_out])
    )
  }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id user_id campaign_id workshop_id attendance_status scheduling_status]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[user]
  end

  def publish_scheduling_scheduled
    WorkshopSubjects::Webhook.new(self).publish_scheduling_scheduled
  end

  alias publish_scheduling_scheduled_create publish_scheduling_scheduled

  def publish_scheduling_cancelled
    WorkshopSubjects::Webhook.new(self).publish_scheduling_cancelled
  end

  def publish_scheduling_rescheduled
    WorkshopSubjects::Webhook.new(self).publish_scheduling_rescheduled
  end

  def publish_workshop_attendance_status
    WorkshopSubjects::Webhook.new(self).publish_workshop_attendance_status
  end

  def campaign_user
    CampaignUser.find_by(user_id: user_id, campaign_id: workshop.campaign_id)
  end

  def send_workshop_booked_email
    send_legacy_workshop_booked_email
    send_delivery_workshop_booked_email
  end

  def send_workshop_cancelled_email
    send_legacy_workshop_cancelled_email
    send_delivery_workshop_cancelled_email
  end

  private

  def send_legacy_workshop_booked_email
    communication = campaign.
                    communications.
                    workshop_booked.
                    where(campaign_assessment_group_id: workshop.campaign_assessment_group_id).
                    last

    return unless communication

    communication.emails.create(
      campaign_user: campaign_user, workshop: workshop, workshop_invite: workshop_invite
    )
  end

  def send_delivery_workshop_booked_email
    delivery = CommunicationDelivery.active_for_campaign_assessment_group(
      'workshop_booked', campaign_id: campaign_id,
      campaign_assessment_group_id: workshop.campaign_assessment_group_id
    )
    return unless delivery

    CommunicationEmail.create!(
      communication_delivery: delivery, campaign_user: campaign_user, workshop: workshop,
      workshop_invite: workshop_invite
    )
  end

  def send_legacy_workshop_cancelled_email
    communication = campaign.communications.workshop_cancelled.
                    where(campaign_assessment_group_id: workshop.campaign_assessment_group_id).last

    return unless communication

    communication.emails.create(
      campaign_user: campaign_user, workshop: workshop, workshop_invite: workshop_invite
    )
  end

  def send_delivery_workshop_cancelled_email
    delivery = CommunicationDelivery.active_for_campaign_assessment_group(
      'workshop_cancelled', campaign_id: campaign_id,
      campaign_assessment_group_id: workshop.campaign_assessment_group_id
    )
    return unless delivery

    CommunicationEmail.create!(
      communication_delivery: delivery, campaign_user: campaign_user, workshop: workshop,
      workshop_invite: workshop_invite
    )
  end
end
