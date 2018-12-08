# TODO (atanych): This job looks like temp hack until MM support answers us
class BuildMindmillResultsJob < ApplicationJob
  queue_as :default

  def perform(assign, current_membership, user_locale)
    mindmill = Api::Mindmill.new(assign, current_membership, user_locale)
    mindmill.load_results
    redirect_back(fallback_location: root_path, error: t('.not_completed')) && return unless mindmill.report
    report = "data:application/pdf;base64,#{mindmill.report}"
    @assign.update(mindmill_report: report, status: :completed, completed_at: Time.current)
  end
end
