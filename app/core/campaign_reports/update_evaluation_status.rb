# frozen_string_literal: true

module CampaignReports
  class UpdateEvaluationStatus < BaseCommand
    private_attr_reader :subject, :status

    def initialize(subject, status)
      @subject = subject
      @status = status
    end

    def call
      updated_subject = subject.update(evaluation_status: status)

      broadcast :ok, updated_subject
    rescue StandardError => e
      broadcast :error, [{ base: e.message }]
    end
  end
end
