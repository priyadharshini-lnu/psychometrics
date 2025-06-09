# frozen_string_literal: true

class Api::V2::Administration::WorkshopSubjectResource < Api::V2::Administration::BaseResource
  attributes :attendance_status, :attended, :preworks, :workshop_activities,
             :language, :late_duration, :scheduling_status, :created_at, :campaign_assessment_group_name,
             :campaign_assessment_group_id
  delegate :full_name, :email, :photo_url, to: :user

  has_one :user
  has_one :workshop

  ransack_filters %i[user_full_name_or_user_email_cont user_id_eq campaign_id_eq]

  audit_log_for :create, payload: '*'

  before_create { @model.campaign_id = context[:campaign].id }
  after_create :increment_booked_seats
  after_create :link_to_workshop_invite

  def link_to_workshop_invite
    workshop_invited_subject = WorkshopInvitedSubject.find_by(
      user_id: @model.user_id,
      workshop_invite_id: WorkshopInvite.where(campaign_id: @model.campaign_id).select(:id),
      status: :pending
    )
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
    if opts[:context][:params][:workshop_id].present?
      Api::Administration::WorkshopSubjectPolicy::Scope.new(
        opts[:context][:user], WorkshopSubject, campaign_id: opts[:context][:params][:campaign_id]
      ).resolve.where(
        workshop_id: opts[:context][:params][:workshop_id]
      )
    else
      Api::Administration::WorkshopSubjectPolicy::Scope.new(
        opts[:context][:user], WorkshopSubject, campaign_id: opts[:context][:params][:campaign_id]
      ).resolve
    end
  end

  def preworks
    return '0/0' unless campaign_preworks[user_id]

    "#{campaign_preworks[user_id]['completed']}/#{campaign_preworks[user_id]['total']}"
  end

  def workshop_activities
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

  def campaign_preworks
    @campaign_preworks ||= Campaigns::GetPreworks.call(context[:campaign].id)[:ok]
  end

  def campaign_workshop_activity
    @campaign_workshop_activity ||= Campaigns::GetWorkshopActivity.call(context[:campaign].id)[:ok]
  end
end
