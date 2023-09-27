# frozen_string_literal: true

class WorkshopSubject < ApplicationRecord
  belongs_to :workshop
  belongs_to :user
  belongs_to :campaign
  belongs_to :workshop_invited_subject
  has_one :workshop_invite, through: :workshop_invited_subject

  enum scheduling_status: { scheduled: 0, rescheduled: 1, cancelled: 2, late_rescheduled: 3, late_cancelled: 4 }
  enum attendance_status: { no_status: 0, on_time: 1, late: 2, no_show: 3, dropped_out: 4 }

  after_commit :send_workshop_booked_email, on: %i[create]
  after_commit :send_workshop_cancelled_email, on: %i[update],
    if: proc { saved_change_to_scheduling_status? && %w[cancelled late_cancelled].include?(scheduling_status) }

  scope :participatable, lambda {
    where.not(attendance_status: %i[no_show dropped_out]).
      where.not(scheduling_status: %i[rescheduled cancelled late_rescheduled late_cancelled])
  }

  def campaign_user
    CampaignUser.find_by(user_id: user_id, campaign_id: workshop.campaign_id)
  end

  def send_workshop_booked_email
    communication = campaign.communications.workshop_booked.last
    return unless communication

    communication.emails.create!(
      campaign_user: campaign_user, workshop: workshop, workshop_invite: workshop_invite
    )
  end

  def send_workshop_cancelled_email
    communication = campaign.communications.workshop_cancelled.last
    return unless communication

    communication.emails.create!(
      campaign_user: campaign_user, workshop: workshop, workshop_invite: workshop_invite
    )
  end
end
