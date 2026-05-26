# frozen_string_literal: true

require 'icalendar/tzinfo'

class Workshop < ApplicationRecord
  include GeoFilterable

  audited

  belongs_to :campaign
  belongs_to :campaign_assessment_group
  include Tenantable

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

  enum :video_call_type, { not_available: 0, internal: 1, custom: 2 }, prefix: :video_call
  enum :status, { open: 0, closed: 1 }

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

  scope :accessible_as_assessor_or_manager, lambda { |user|
    Workshop.
      left_joins(:workshop_assessors, :workshop_managers).
      where('workshop_assessors.user_id = :user_id OR workshop_managers.user_id = :user_id', user_id: user.id).
      distinct
  }

  after_save :create_meeting_room, if: -> { video_call_internal? && meeting_room.blank? }

  def self.scoped_by_client(restricted_client_subquery)
    return all if restricted_client_subquery.blank?

    joins(campaign: :project).
      where.not(clients: { tte_id: restricted_client_subquery })
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[campaign_assessment_group_id campaign_id duration id name status]
  end

  def self.ransackable_associations(_auth_object = nil)
    %i[workshop_invited_subjects]
  end

  def self.ransackable_scopes(_)
    %i[search_query]
  end

  def end_time
    start_time.advance(seconds: duration)
  end

  def cancellable?
    Time.current < (start_time - cancellation_lead_time)
  end

  def scheduling_lead_time_passed?
    Time.current > (start_time - scheduling_lead_time)
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

  def real_meeting_link(user)
    if video_call_internal? && meeting_room.present? && meeting_room.external_id.present?
      route = user.admin? ? :admin_meeting_url : :meeting_url
      Utility::Url.generate(route, room_id: meeting_room.id, subdomain: user.subdomain)
    elsif video_call_custom?
      meeting_link
    end
  end

  def removeable?
    workshop_subjects.empty? || workshop_subjects.removeable_subjects.count == workshop_subjects.count
  end

  def increment_booked_seats
    update_query = <<-SQL.squish
      UPDATE workshops
      SET booked_seats = booked_seats + 1
      WHERE id = #{id} AND booked_seats < total_seats
    SQL

    result = ActiveRecord::Base.connection.execute(update_query)
    updated_record_count = result.cmd_status.split.last.to_i

    raise ::Workshops::SeatsNotAvailableError if updated_record_count.zero?
  end
end
