# frozen_string_literal: true

module Hogan
  class PassAssessment < Rectify::Command
    def initialize(assign, membership, project)
      @assign = assign
      @membership = membership
      @project = project
    end

    def call
      return broadcast(:invalid) unless assign.assessment.hogan?

      transaction do
        start_assign
        build_hogan_credential unless membership.hogan_credential
      end

      broadcast(:ok)
    rescue StandardError => e
      Rails.logger.error(e)
      broadcast(:invalid)
    end

    private

    attr_reader :assign, :membership, :project

    def start_assign
      assign.in_progress!
    end

    def build_hogan_credential
      assessment_params = {
        group: project.hogan_group_name,
        membership: membership,
        assessment: assign.assessment,
        reports: assign.reports
      }
      ::Services::Hogan::AssignAssessmentAndReports.call!(assessment_params: assessment_params)
    end
  end
end
