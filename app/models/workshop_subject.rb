# frozen_string_literal: true

class WorkshopSubject < ApplicationRecord
  belongs_to :workshop
  belongs_to :user
  belongs_to :campaign
  belongs_to :workshop_invited_subject
  has_one :workshop_invite, through: :workshop_invited_subject

  enum attendance_status: { no_status: 0, on_time: 1, late: 2, no_show: 3, dropped_out: 4 }
  enum completion_status: { not_started: 0, completed: 1 }

  after_commit :send_workshop_booked_email, on: %i[create]
  after_commit :send_workshop_completed_email, on: %i[update],
    if: proc { completion_status_previously_changed? || completed? }
  after_commit :send_workshop_cancelled_email, on: %i[destroy]

  scope :participatable, lambda {
    where.not(attendance_status: %i[no_show dropped_out]).
      where.not(completion_status: :completed)
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

  def send_workshop_completed_email
    communication = campaign.communications.workshop_completed.last
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
