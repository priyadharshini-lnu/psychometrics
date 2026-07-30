# frozen_string_literal: true

class Api::V2::Administration::WorkshopSubjectResource < Api::V2::Administration::BaseResource
  attributes :attendance_status, :attended, :preworks, :workshop_id, :workshop_activities, :meeting_link,
             :language, :late_duration, :scheduling_status, :created_at, :campaign_assessment_group_name,
             :campaign_assessment_group_id, :full_name, :email, :photo_url, :workshop_name,
             :workshop_start_time, :workshop_timezone, :duration
  delegate :full_name, :email, :photo_url, to: :user

  has_one :user
  has_one :workshop
  has_one :campaign

  filter :date_filter, apply: lambda { |records, val, _options|
    results = records.joins(:workshop)
    if val[0] == 'current'
      results = results.where(
        'workshops.start_time < ? and workshops.start_time + workshops.duration * interval \'1 second\' > ?',
        Time.current, Time.current
      )
    end
    if val[0] == 'upcoming'
      results = results.where('workshops.start_time > ?', Time.current)
    end
    if val[0] == 'past'
      results = results.where('workshops.start_time + workshops.duration * interval \'1 second\' < ?', Time.current)
    end
    results
  }

  ransack_filters %i[user_full_name_or_user_email_cont user_id_eq campaign_id_eq
                     campaign_id_in workshop_id_in]

  filter :scheduling_status_in, apply: lambda { |records, values, _options|
    enum_values = values.filter_map { |v| WorkshopSubject.scheduling_statuses[v] }
    enum_values.any? ? records.where(scheduling_status: enum_values) : records.none
  }

  filter :attendance_status_in, apply: lambda { |records, values, _options|
    enum_values = values.filter_map { |v| WorkshopSubject.attendance_statuses[v] }
    enum_values.any? ? records.where(attendance_status: enum_values) : records.none
  }

  audit_log_for :create, payload: '*'

  before_create { @model.campaign_id = context[:campaign].id }
  after_create :increment_booked_seats
  after_create :link_to_workshop_invite

  def link_to_workshop_invite
    workshop_invited_subject = WorkshopInvitedSubject.
                               joins(workshop_invite: :workshops).
                               where(
                                 user_id: @model.user_id,
                                 status: :pending,
                                 workshop_invites: {
                                   campaign_id: @model.campaign_id,
                                   campaign_assessment_group_id: @model.workshop.campaign_assessment_group_id
                                 },
                                 workshops: { id: @model.workshop_id }
                               ).
                               order(created_at: :desc).
                               first
    return unless workshop_invited_subject

    ApplicationRecord.transaction do
      @model.update!(workshop_invited_subject_id: workshop_invited_subject.id)
      workshop_invited_subject.update!(status: :accepted)
    end
  end

  def increment_booked_seats
    @model.workshop.increment_booked_seats
  rescue ::Workshops::SeatsNotAvailableError => e
    @model.errors.add(:base, e.message)
    raise JSONAPI::Exceptions::ValidationErrors, self
  end

  before_update do
    @model.attendance_status = 'no_show' if @model.attended == true
  end

  def language
    @model.preferred_language
  end

  def self.records(opts = {})
    scope = Api::Administration::WorkshopSubjectPolicy::Scope.new(
      opts[:context][:user], WorkshopSubject, campaign_id: opts[:context][:params][:campaign_id]
    ).resolve

    scope = scope.includes(
      { user: { user_profile: { photo_attachment: :blob } } },
      { campaign: %i[default_idp_template dashboard threesixty_campaign] },
      {
        workshop: %i[campaign_assessment_group meeting_room tenant]
      }
    )

    if opts[:context][:params][:workshop_id].present?
      scope = scope.where(workshop_id: opts[:context][:params][:workshop_id])
    end
    scope
  end

  def preworks
    return '0/0' unless campaign_preworks[user_id]

    "#{campaign_preworks[user_id]['completed']}/#{campaign_preworks[user_id]['total']}"
  end

  def workshop_activities
    return workshop_activity_details if requested_activity_fields.present?

    return '0/0' unless campaign_workshop_activity[user_id]

    "#{campaign_workshop_activity[user_id]['completed']}/#{campaign_workshop_activity[user_id]['total']}"
  end

  def meta_details
    {
      assessor_assessments: lambda {
        campaigns_assessor_assessments
      },
      assessors: lambda {
        assessors
      }
    }
  end

  def campaign_assessment_group_name
    @model.workshop.campaign_assessment_group.name
  end

  def campaign_assessment_group_id
    @model.workshop.campaign_assessment_group.id
  end

  def campaign_name
    @model.campaign&.name
  end

  def workshop_name
    @model.workshop&.name
  end

  def workshop_start_time
    @model.workshop.start_time
  end

  def workshop_timezone
    @model.workshop.timezone
  end

  def duration
    @model.workshop.duration
  end

  def meeting_link
    @model.workshop.real_meeting_link(context[:user])
  end

  private

  def assessors
    @model.workshop.workshop_assessors.map do |assessor|
      {
        id: assessor.id.to_s,
        user_id: assessor.user.id.to_s,
        name: assessor.user.name,
        photo_url: assessor.user.photo_url
      }
    end
  end

  def campaigns_assessor_assessments
    @model.campaign.campaign_assessor_assessments.map do |campaign_assessor_assessment|
      {
        id: campaign_assessor_assessment.id,
        name: campaign_assessor_assessment.assessment.name,
        assessment_id: campaign_assessor_assessment.assessment_id,
        subject_linked_activity_present: subject_assessor_assessments[
          campaign_assessor_assessment.assessment&.linked_assessment_id
        ].present?
      }
    end
  end

  def subject_assessor_assessments
    @subject_assessor_assessments ||= UserAssessment.where(
      relationship_id: Relationship.self_relationship.id,
      evaluator_id: @model.user_id,
      subject_id: @model.user_id,
      campaign_id: @model.campaign_id
    ).index_by(&:assessment_id)
  end

  def subject_workshop_activities
    @subject_workshop_activities ||= UserAssessment.with_campaign_assessments.with_workshop_activities.
                                     where(campaign_id: @model.campaign_id, subject_id: @model.user_id).
                                     where.not(evaluator_id: @model.user_id).
                                     includes({ assessment: %i[translations linked_assessment] }, :evaluator)
  end

  def activity_evaluator(activity)
    return unless activity.evaluator

    {
      id: activity.evaluator.id.to_s,
      full_name: activity.evaluator.name,
      email: activity.evaluator.email
    }
  end

  def resolved_campaign
    context[:campaign] || @model.campaign
  end

  def campaign_preworks
    return {} unless resolved_campaign

    @campaign_preworks ||= Campaigns::GetPreworks.call(resolved_campaign.id)[:ok]
  end

  def campaign_workshop_activity
    return {} unless resolved_campaign

    @campaign_workshop_activity ||= Campaigns::GetWorkshopActivity.call(resolved_campaign.id)[:ok]
  end

  def workshop_activity_details
    fields = requested_activity_fields
    subject_workshop_activities.map do |activity|
      detail = {}
      detail[:name] = activity.assessment&.name if fields.include?('name')
      detail[:status] = activity.status if fields.include?('status')
      detail[:schedule_time] = activity.schedule_time if fields.include?('schedule_time')
      linked_subject_meeting_link = activity.linked_subject_user_assessment&.real_meeting_link(context[:user])
      if fields.include?('linked_subject_meeting_link')
        detail[:linked_subject_meeting_link] =
          linked_subject_meeting_link
      end
      detail[:evaluator] = activity_evaluator(activity) if fields.include?('evaluator')
      detail
    end
  end

  def requested_activity_fields
    @requested_activity_fields ||= context[:params].dig(:fields, :workshop_activities)&.split(',')&.map(&:strip) || []
  end
end
