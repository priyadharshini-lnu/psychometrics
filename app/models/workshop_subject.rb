# frozen_string_literal: true

class WorkshopSubject < ApplicationRecord
  belongs_to :workshop
  belongs_to :user
  belongs_to :campaign

  enum attendance_status: { no_status: 0, on_time: 1, late: 2, no_show: 3, dropped_out: 4 }
  enum completion_status: { not_started: 0, completed: 1 }
end
