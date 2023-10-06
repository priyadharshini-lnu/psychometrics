# frozen_string_literal: true

require 'icalendar/tzinfo'

class Workshop < ApplicationRecord
  belongs_to :campaign
  has_one :project, through: :campaign
  has_and_belongs_to_many :workshop_invites, dependent: :destroy
  has_many :workshop_invite_logs
  has_many :workshop_invited_subjects, through: :workshop_invites
  has_many :workshop_subjects
  has_many :subjects, through: :workshop_subjects, source: :user
  has_many :workshop_assessors
  has_many :workshop_resources
  has_many :assessors, through: :workshop_assessors, source: :user
  has_many :workshop_managers
  has_many :managers, through: :workshop_managers, source: :user
  has_many :user_bookings, dependent: :destroy, as: :booked_by_resource
  has_many :campaign_assessments, -> { workshop_activities }, through: :campaign
  has_one :meeting_room, as: :meetable, dependent: :destroy
  has_many :communication_emails, dependent: :destroy

  enum video_call_type: { not_available: 0, internal: 1, custom: 2 }, _prefix: :video_call
  enum status: { open: 0, closed: 1 }

  scope :search_query, lambda { |query|
    where('workshops.start_time >= ?', Time.current.beginning_of_day).
      where('workshops.name ILIKE ?', "%#{query}%")
  }
  scope :visible_to_end_user, lambda { |user_id|
    Workshop.
      includes(:workshop_subjects).
      where(workshop_subjects: { user_id: user_id }).
      merge(WorkshopSubject.participatable)
  }

  after_save :create_meeting_room, if: -> { video_call_internal? && meeting_room.blank? }

  def self.ransackable_scopes(_)
    %i[search_query]
  end

  def end_time
    start_time.advance(seconds: duration)
  end

  def cancellable?
    Time.current < (start_time - cancellation_lead_time)
  end

  def reschedulable?
    Time.current < (start_time - reschedule_lead_time)
  end

  def seats_available?
    booked_seats < total_seats
  end

  def create_meeting_room
    create_meeting_room!
  end

  def formatted_start_time
    I18n.l(start_time.in_time_zone(timezone), format: :workshop_date)
  end

  def formatted_end_time
    I18n.l(end_time.in_time_zone(timezone), format: :workshop_date)
  end

  def real_meeting_link
    if video_call_internal? && meeting_room.present?
      Utility::Url.generate(:admin_meeting_url, room_id: meeting_room.id)
    elsif video_call_custom?
      meeting_link
    end
  end

  def increment_booked_seats
    if booked_seats < total_seats
      self.booked_seats += 1
      save
    else
      errors.add(:base, :seats_not_available)
      raise I18n.t('administration.errors.bookings.seats_not_available')
    end
  end
end
