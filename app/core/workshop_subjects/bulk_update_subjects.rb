# frozen_string_literal: true

module WorkshopSubjects
  class BulkUpdateSubjects < BaseCommand
    def initialize(workshop, schedule_data)
      @workshop = workshop
      @schedule_data = schedule_data || []
      @override_existing = schedule_data[:override_existing] || false
    end

    def call
      subjects = @workshop.workshop_subjects.where(id: @schedule_data[:subject_ids])
      user_assessments = @workshop.campaign.user_assessments.where(subject_id: subjects.pluck(:user_id))

      @schedule_data[:assessments].each do |data|
        next if data[:action] == 'no_change'

        user_assessments_to_update = user_assessments.where(assessment_id: data[:assessment_id])
        unless @override_existing
          user_assessments_to_update = user_assessments_to_update.where(schedule_updated: false)
        end

        if data[:action] == 'schedule'
          user_assessments_to_update.update(schedule_time: data[:time], schedule_updated: true)
        end
        user_assessments_to_update.update(schedule_time: nil, schedule_updated: true) if data[:action] == 'unschedule'
      end

      broadcast :ok
    end
  end
end
