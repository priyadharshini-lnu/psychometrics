# frozen_string_literal: true

class WorkshopInviteLog < ApplicationRecord
  belongs_to :workshop_invite
  belongs_to :user
  belongs_to :created_by, class_name: 'User'

  enum action: {
    accepted: 1,
    cancelled: 2,
    requested_cancellation: 3,
    requested_rescheduling: 4,
    rescheduled: 5,
    requested_cancellation_rejected: 6,
    requested_rescheduling_rejected: 7
  }
end
