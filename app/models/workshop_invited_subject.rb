# frozen_string_literal: true

class WorkshopInvitedSubject < ApplicationRecord
  belongs_to :workshop_invite
  belongs_to :user
  has_many :workshops, through: :workshop_invite

  enum status: {
    pending: 0, accepted: 1, cancelled: 2,  requested_cancellation: 3,
    requested_rescheduling: 4, rescheduled: 5
  }
end
