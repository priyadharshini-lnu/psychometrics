# frozen_string_literal: true

class WorkshopInviteLog < ApplicationRecord
  belongs_to :workshop
  belongs_to :user
  belongs_to :created_by, class_name: 'User'

  enum status: {
    accepted: 1, cancelled: 2, requested_cancellation: 3,
    requested_rescheduling: 4, rescheduled: 5
  }
end
