# frozen_string_literal: true

module AdminJobs
  class BulkCreateWorkshopInvites < AdminJobs::Base
    def call
      subjects = record.data['subjects']

      WorkshopInvites::BulkCreateSubjects.call!(workshop_invite, subjects)

      broadcast :ok
    end

    def generate_details
      [
        [
          I18n.t('administration.assessment_center.invite.subjects_count_added'),
          record.data['subjects']&.count
        ]
      ]
    end

    def valid?
      workshop_invite.present?
    end

    private

    def workshop_invite
      @workshop_invite ||= WorkshopInvite.find_by(id: record.data['workshop_invite_id'])
    end
  end
end
