# frozen_string_literal: true

module Yoodli
  class ResetAssessment < BaseCommand
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      current_active_assessment = user_assessment.yoodli_user_assessment

      return broadcast :ok if current_active_assessment.email.blank?

      transaction do
        current_active_assessment&.update!(active: false)

        YoodliUserAssessment.create!(user_assessment: user_assessment, active: true)
      end

      broadcast :ok
    end
  end
end
