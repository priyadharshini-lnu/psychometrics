# frozen_string_literal: true

class AICampaignArtifactResultsGeneratorJob < ApplicationJob
  def perform(campaign_artifact, user, admin_job_record = nil, options = {})
    result_generator = AI::CampaignArtifacts::ResultGenerator.new(campaign_artifact, user, options)
    result_generator.on(:ok) do
      admin_job_record&.increment_completed_tasks!
    end.on(:error) do |_error_message|
      add_error_to_admin_job(admin_job_record, campaign_artifact, user)
      admin_job_record&.increment_completed_tasks!
    end.call
  end

  private

  def add_error_to_admin_job(admin_job_record, campaign_artifact, user)
    return unless admin_job_record

    formatted_error = I18n.t('admin.ai_artifact_result_generation_admin_job_failed',
                             artifact_name: campaign_artifact.name,
                             user_email: user.email)
    admin_job_record.with_lock do
      current_errors = admin_job_record.error_messages || []
      admin_job_record.update!(error_messages: current_errors + [formatted_error])
    end
  end
end
