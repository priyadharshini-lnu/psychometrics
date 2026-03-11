# frozen_string_literal: true

module AdminJobs
  class RescoreUserAssessment < AdminJobs::Base
    def call
      record.update(total_tasks: 1)

      recompute = ::UsersResults::Recompute.new(
        user_result, owner,
        admin_job_record_id: record.id,
        allow_ai_rescore: record.data['allow_ai_rescore']
      )
      recompute.on(:ok) do
        record.increment_completed_tasks!
        broadcast :ok
      end
      recompute.on(:waiting) { broadcast :waiting }
      recompute.call
    end

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/users/#{user.id}",
        label: "#{campaign.name} - #{user.decorate.full_name}"
      }
    end

    def generate_details
      [
        [I18n.t('administration.users.user'), user.decorate.full_name],
        [I18n.t('administration.assessments.assessment'), user_result.assessment.name]
      ]
    end

    def valid?
      campaign.present? && user_result.present? && user.present? && user_result.assessment.present?
    end

    private

    def user_result
      @user_result ||= UsersResult.find_by(id: record.data['user_result_id'])
    end

    def user
      user_result&.user
    end
  end
end
