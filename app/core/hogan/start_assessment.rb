# frozen_string_literal: true

module Hogan
  class StartAssessment < BaseCommand
    private_attr_reader :user_result, :credentials, :project

    def initialize(user_result, credentials, project)
      @user_result = user_result
      @credentials = credentials
      @project = project
    end

    def call
      return broadcast(:invalid) unless user_result.assessment.hogan?

      transaction do
        start_user_result
        build_hogan_credential
      end

      broadcast(:ok)
    rescue StandardError => e
      Rails.logger.error(e)
      broadcast(:invalid)
    end

    def start_user_result
      user_result.in_progress!
    end

    def build_hogan_credential
      Hogan::AddReports.call!(
        group: project.hogan_group_name,
        credentials: credentials,
        assessment: user_result.assessment,
        reports: user_result.external_user_reports(:hogan),
        user_id: user_result.evaluator_id
      )
    end
  end
end
