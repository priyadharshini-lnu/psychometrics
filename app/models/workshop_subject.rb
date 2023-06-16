# frozen_string_literal: true

class WorkshopSubject < ApplicationRecord
  belongs_to :workshop
  belongs_to :user

  enum status: { not_started: 0, late: 1, no_show: 2, completed: 3, dropped_out: 4 }
end
