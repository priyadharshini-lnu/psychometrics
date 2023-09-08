# frozen_string_literal: true

class Api::V2::Administration::WorkshopResource < Api::V2::Administration::BaseResource
  attributes :campaign_id, :start_time, :timezone, :duration, :video_call_type, :total_seats, :cancellation_lead_time,
             :reschedule_lead_time, :booked_seats, :remaining_seats, :meeting_link, :workshop_assessors_ids,
             :workshop_managers_ids, :name

  has_many :workshop_managers
  has_many :workshop_assessors
  has_many :workshop_subjects
  has_many :workshop_resources
  has_one :campaign

  filter :start_time_between, apply: lambda { |records, date_range, _options|
    records.where(start_time: (date_range.first...date_range.last))
  }

  filter :date_filter, apply: lambda { |records, val, _options|
    results = records
    if val[0] == 'current'
      results = records.where('start_time < ? and start_time + duration * interval \'1 second\' > ?',
                              Time.current, Time.current)
    end
    if val[0] == 'upcoming'
      results = records.where('start_time > ?', Time.current)
    end
    if val[0] == 'past'
      results = records.where('start_time + duration * interval \'1 second\' < ?', Time.current)
    end
    results
  }

  ransack_filters %i[search_query]

  def fetchable_fields
    super - %i[workshop_assessors_ids workshop_managers_ids]
  end

  def self.updatable_fields(_context)
    %i[workshop_assessors_ids workshop_managers_ids total_seats name video_call_type meeting_link]
  end

  def remaining_seats
    @model.total_seats - @model.booked_seats
  end

  def meeting_link
    if @model.video_call_internal? && @model.meeting_room.present?
      Utility::Url.generate(:admin_meeting_url, room_id: @model.meeting_room.id)
    elsif @model.video_call_custom?
      @model.meeting_link
    end
  end

  def self.default_sort
    [{ field: 'start_time', direction: :asc }]
  end

  def self.records(opts = {})
    Api::Administration::WorkshopPolicy::Scope.new(
      opts[:context][:user],
      Workshop,
      campaign_id: opts[:context][:params]['campaign_id']
    ).resolve
  end

  def meta_details
    {
      permissions: lambda {
        GetPermissionsHash.call!(
          Api::Administration::WorkshopPolicy,
          context[:user],
          @model,
          %w[update],
          { campaign_id: @model.campaign_id }
        )
      }
    }
  end
end
