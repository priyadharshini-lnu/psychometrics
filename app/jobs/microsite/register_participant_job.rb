# frozen_string_literal: true

module Microsite
  class RegisterParticipantJob < ApplicationJob
    queue_as :default

    def perform(user_assessment_id)
      user_assessment = UserAssessment.find_by(id: user_assessment_id)
      return unless user_assessment&.microsite?

      Microsite::RegisterParticipant.call!(user_assessment)
    end
  end
end
