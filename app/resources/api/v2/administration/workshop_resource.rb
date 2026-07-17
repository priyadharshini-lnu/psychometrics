# frozen_string_literal: true

class Api::V2::Administration::WorkshopResource < Api::V2::Administration::BaseResource
  attributes :campaign_id, :start_time, :timezone, :duration, :video_call_type, :total_seats, :cancellation_lead_time,
             :scheduling_lead_time, :booked_seats, :remaining_seats, :meeting_link, :workshop_assessors_ids,
             :workshop_managers_ids, :name, :status, :allow_late_cancellation_and_rescheduling,
             :campaign_assessment_group_id, :disable_cancellation_and_rescheduling, :video_recording_enabled

  has_many :workshop_managers
  has_many :workshop_assessors
  has_many :workshop_subjects
  has_many :workshop_resources
  has_many :workshop_invited_subjects
  has_one :campaign
  has_one :campaign_assessment_group

  filter :start_time_between, apply: lambda { |records, date_range, _options|
    records.where(start_time: (date_range.first...date_range.last.to_time.end_of_day))
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

  ransack_filters %i[search_query workshop_invited_subjects_user_id_eq campaign_assessment_group_id_eq]

  def fetchable_fields
    super - %i[workshop_assessors_ids workshop_managers_ids]
  end

  def self.updatable_fields(_context)
    %i[workshop_assessors_ids
       workshop_managers_ids
       total_seats
       scheduling_lead_time
       cancellation_lead_time
       allow_late_cancellation_and_rescheduling
       disable_cancellation_and_rescheduling
       campaign_assessment_group_id
       name
       video_call_type meeting_link status
       start_time]
  end

  def campaign_assessment_group_id
    @model.campaign_assessment_group_id.to_s
  end

  def remaining_seats
    @model.total_seats - @model.booked_seats
  end

  def meeting_link
    @model.real_meeting_link(context[:user])
  end

  def self.default_sort
    [{ field: 'start_time', direction: :asc }]
  end

  def self.records(opts = {})
    Api::Administration::WorkshopPolicy::Scope.new(
      opts[:context][:user],
      Workshop,
      campaign_id: opts[:context][:params]['campaign_id']
    ).resolve.includes(
      :meeting_room,
      :tenant,
      campaign: %i[default_idp_template dashboard threesixty_campaign]
    )
  end

  def meta_details
    {
      permissions: lambda {
        GetPermissionsHash.call!(
          Api::Administration::WorkshopPolicy,
          context[:user],
          @model,
          %w[update view_recordings],
          { campaign_id: @model.campaign_id }
        )
      }
    }
  end

  def video_recording_enabled
    @model.meeting_room&.video_recording_enabled? || false
  end
end
