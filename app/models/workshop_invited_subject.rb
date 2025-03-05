# frozen_string_literal: true

class WorkshopInvitedSubject < ApplicationRecord
  audited

  belongs_to :workshop_invite
  belongs_to :user
  belongs_to :reschedule_workshop, class_name: 'Workshop', optional: true

  has_one :workshop_subject, dependent: :nullify
  has_many :workshop_subjects, dependent: :nullify
  has_many :workshops, through: :workshop_invite
  has_one :campaign, through: :workshop_invite

  enum :status, {
    pending: 0,
    accepted: 1,
    cancelled: 2,
    requested_cancellation: 3,
    requested_rescheduling: 4,
    rescheduled: 5,
    requested_cancellation_rejected: 6,
    requested_rescheduling_rejected: 7
  }

  after_commit :send_workshop_invite_email, on: %i[create]
  after_commit :publish_scheduling_invited, on: %i[create]

  scope :invites, -> { where(status: :pending) }
  scope :bookings, -> { where.not(status: :pending) }
  scope :filterable_fields, ->(query) { joins(:user).merge(User.filterable_fields(query)) }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id workshop_invite_campaign user_id]
  end

  def self.ransackable_scopes(_auth_object = nil)
    %i[filterable_fields]
  end

  def campaign_user
    CampaignUser.find_by(user_id: user_id, campaign_id: workshop_invite.campaign_id)
  end

  def send_workshop_invite_email
    communication = campaign.communications.workshop_invite.last
    return unless communication

    communication.emails.create(campaign_user: campaign_user, workshop_invite: workshop_invite)
  end

  def scheduled_workshop_subject
    workshop_subjects.find_by(scheduling_status: :scheduled)
  end

  def publish_scheduling_invited
    WorkshopInvites::Webhook.new(self).publish_scheduling_invited
  end

  def reschedulable?
    requested_rescheduling? || requested_rescheduling_rejected?
  end

  def cancellable?
    requested_cancellation? || requested_cancellation_rejected?
  end

  def rejectable?
    requested_cancellation? || requested_rescheduling?
  end
end
