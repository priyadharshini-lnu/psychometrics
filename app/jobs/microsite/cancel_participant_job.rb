# frozen_string_literal: true

module Microsite
  class CancelParticipantJob < ApplicationJob
    queue_as :default

    def perform(participant_id:, project_id:)
      CancelParticipant.call(participant_id: participant_id, project_id: project_id)
    end
  end
end
