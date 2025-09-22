# frozen_string_literal: true

module Workshops
  class ListAllRecordings < BaseCommand
    private_attr_reader :workshop, :user

    def initialize(workshop, user)
      @workshop = workshop
      @user = user
    end

    def call
      broadcast :ok, all_recordings
    end

    private

    def all_recordings
      workshop_recordings + assessment_recordings
    end

    def workshop_recordings
      @workshop.meeting_room&.meeting_recordings.to_a
    end

    def assessment_recordings
      user.assessor? ? assessor_recordings : admin_recordings
    end

    def user_assessments_scope
      @user_assessments_scope ||= UserAssessment.with_campaign_assessments.
                                  with_workshop_activities.
                                  where(campaign_id: workshop.campaign).
                                  where(subject_id: workshop.workshop_subjects.select(:user_id))
    end

    def admin_recordings
      user_assessments_scope.
        includes(meeting_room: :meeting_recordings).
        flat_map { |ua| ua.linked_subject_user_assessment&.meeting_room&.meeting_recordings.to_a }.
        compact
    end

    # rubocop:disable Layout/LineLength
    def lead_assessor_subjects
      user_assessments_scope.
        includes(:assessment).
        select { |ua| ua.assessment&.category == Assessment::CATEGORIES[:lead_assessor_form] && ua.evaluator_id == user.id }.
        filter_map(&:subject).
        compact
    end
    # rubocop:enable Layout/LineLength

    def assessor_recordings
      user_assessments_scope.
        includes(meeting_room: :meeting_recordings).
        select { |ua| lead_assessor_subjects.include?(ua.subject) || ua.evaluator_id == user.id }.
        flat_map { |ua| ua.linked_subject_user_assessment&.meeting_room&.meeting_recordings.to_a }.
        compact
    end
  end
end
