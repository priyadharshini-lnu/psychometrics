# frozen_string_literal: true

class Workshop < ApplicationRecord
  belongs_to :campaign
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

  enum video_call_type: { not_available: 0, internal: 1, custom: 2 }

  scope :search_query, lambda { |query|
    where('TO_CHAR(start_time, \'ddth FMMonth yyyy, HH:MI am\') ILIKE ?', "%#{query}%")
  }

  def self.ransackable_scopes(_)
    %i[search_query]
  end
end
