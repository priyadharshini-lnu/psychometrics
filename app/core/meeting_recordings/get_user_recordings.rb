# frozen_string_literal: true

module MeetingRecordings
  class GetUserRecordings < BaseCommand
    private_attr_reader :user, :campaign_id, :current_user

    def initialize(user, campaign_id, current_user)
      @user = user
      @campaign_id = campaign_id
      @current_user = current_user
    end

    def call
      broadcast :ok, all_recordings
    end

    private

    def all_recordings
      if current_user.assessor? && lead_assessor?
        lead_assessor_recordings
      elsif current_user.assessor?
        assessor_recordings
      else
        admin_recordings
      end
    end

    def admin_recordings
      (workshop_recordings + assessment_recordings).sort_by(&:id)
    end

    def assessor_recordings
      (assessor_workshop_recordings + assessor_assessment_recordings).sort_by(&:id)
    end

    def lead_assessor_recordings
      (workshop_recordings + assessment_recordings).sort_by(&:id)
    end

    def workshops
      WorkshopSubject.where(user_id: user.id, campaign_id: campaign_id).
        includes(:workshop).map(&:workshop).uniq
    end

    def workshop_recordings
      workshops&.flat_map do |workshop|
        workshop.meeting_room&.meeting_recordings.to_a
      end&.compact
    end

    def assessments
      UserAssessment.with_campaign_assessments.
        with_workshop_activities.
        where(campaign_id: campaign_id, subject: user).
        includes(:assessment)
    end

    def assessment_recordings
      assessments.includes(meeting_room: :meeting_recordings).
        flat_map { |ua| ua.linked_subject_user_assessment&.meeting_room&.meeting_recordings.to_a }.
        compact
    end

    def assessor_workshops
      Workshop.joins(:workshop_assessors, :workshop_subjects).
        where(workshop_assessors: { user_id: current_user.id }, workshop_subjects: { user_id: user.id,
                                                                                     campaign_id: campaign_id }).
        distinct
    end

    def assessor_workshop_recordings
      assessor_workshops.flat_map do |workshop|
        workshop.meeting_room&.meeting_recordings.to_a
      end.compact
    end

    def assessor_assessments
      @assessor_assessments ||= UserAssessment.with_campaign_assessments.
                                with_workshop_activities.
                                where(campaign_id: campaign_id, subject_id: user.id, evaluator_id: current_user.id)
    end

    def assessor_assessment_recordings
      assessor_assessments.
        includes(meeting_room: :meeting_recordings).
        flat_map { |ua| ua.linked_subject_user_assessment&.meeting_room&.meeting_recordings.to_a }.
        compact
    end

    def lead_assessor?
      Users::GetLeadAssessor.call!(campaign, user)&.id == current_user.id
    end

    def campaign
      @campaign ||= Campaign.find(campaign_id)
    end
  end
end
