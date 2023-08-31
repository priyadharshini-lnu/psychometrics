# frozen_string_literal: true

module WorkshopInvites
  class BulkCreateSubjects < BaseCommand
    def initialize(workshop_invite, subjects)
      @workshop_invite = workshop_invite
      @subjects_data = subjects || []
    end

    def call
      @subjects_data.map do |subject|
        @workshop_invite.workshop_invited_subjects.find_or_create_by!(subject)
      end
    end
  end
end
