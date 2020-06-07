# frozen_string_literal: true

# TODO: (atanych): This job looks like temp hack until MM support answers us
class BuildMindmillResultsJob < ApplicationJob
  queue_as :external_results
  retry_on StandardError, wait: ->(executions) { executions * 2.minutes }, attempts: 3

  def perform(assign, current_membership, user_locale = 'en', regenerate: true)
    return if !regenerate && assign.mindmill_report && assign.external_results

    mindmill = Api::Mindmill.new(assign, current_membership, user_locale)
    mindmill.load_results
    mindmill.load_scores
    raise StandardError, 'Unable to fetch mindmill report' unless mindmill.report && mindmill.scores

    normalised_scores = Imports::External::BaseExternalImport.build(:mindmill).process(mindmill.scores, assign)
    report = "data:application/pdf;base64,#{mindmill.report}"
    assign.update(
      mindmill_report: report,
      external_results: normalised_scores,
      status: :completed,
      completed_at: Time.current
    )
    assign.assigns_reports.update_all(generating: false)
  end
end
