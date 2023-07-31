# frozen_string_literal: true

class Api::V2::Administration::WorkshopResource < Api::V2::Administration::BaseResource
  attributes :start_time, :duration, :booked_seats, :total_seats, :remaining_seats, :timezone, :meeting_link

  has_many :workshop_managers
  has_many :workshop_assessors
  has_many :workshop_subjects

  filter :start_time_between, apply: lambda { |records, date_range, _options|
    records.where(start_time: (date_range.first...date_range.last))
  }

  def remaining_seats
    @model.total_seats - @model.booked_seats
  end

  def self.default_sort
    [{ field: 'start_time', direction: :asc }]
  end

  def self.records(opts = {})
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, Workshop]).where(
      campaign_id: opts[:context][:params]['campaign_id']
    )
  end
end
