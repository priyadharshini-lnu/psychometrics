# frozen_string_literal: true

module AdminJobs
  class RescoreUserAssessment < AdminJobs::Base
    def call
      ::UsersResults::Recompute.call!(user_result, owner)
      broadcast :ok
    end

    def generate_title_link
      {
        href: "/administration/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/users/#{user.id}",
        label: "#{campaign.name} - #{user.decorate.full_name}"
      }
    end

    def generate_details
      [
        [I18n.t('administration.users.user'), user.decorate.full_name],
        [I18n.t('administration.assessments.assessment'), user_result.assessment.name]
      ]
    end

    private

    def user_result
      @user_result ||= UsersResult.find(record.data['user_result_id'])
    end

    def user
      user_result.user
    end
  end
end
