# frozen_string_literal: true

class Api::V2::Administration::WorkshopResource < Api::V2::Administration::BaseResource
  attributes :campaign_id, :start_time, :timezone, :duration, :video_call_type, :total_seats, :cancellation_lead_time,
             :reschedule_lead_time, :booked_seats, :remaining_seats, :meeting_link

  has_many :workshop_managers
  has_many :workshop_assessors
  has_many :workshop_subjects

  filter :start_time_between, apply: lambda { |records, date_range, _options|
    records.where(start_time: (date_range.first...date_range.last))
  }

  ransack_filters %i[search_query]

  def remaining_seats
    @model.total_seats - @model.booked_seats
  end

  def self.default_sort
    [{ field: 'start_time', direction: :asc }]
  end

  def self.records(opts = {})
    super(opts).where(campaign_id: opts[:context][:params]['campaign_id'])
  end
end
