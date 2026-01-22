# frozen_string_literal: true

module Mhs
  class ResetAssessment < BaseCommand
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      current_active_assessment = user_assessment.mhs_user_assessment

      transaction do
        current_active_assessment&.update!(active: false)

        MhsUserAssessment.create!(
          user_assessment: user_assessment,
          active: true,
          confidence_interval: current_active_assessment&.confidence_interval,
          leadership_bar: current_active_assessment&.leadership_bar,
          norm_region: current_active_assessment&.norm_region,
          norm_option: current_active_assessment&.norm_option
        )
      end

      broadcast :ok
    end
  end
end
