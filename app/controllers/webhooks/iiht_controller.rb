# frozen_string_literal: true

module Webhooks
  class IihtController < ActionController::Base
    skip_before_action :verify_authenticity_token

    def results
      response = JSON.parse(request.raw_post)
      schedule_config = JSON.parse(response.dig('schedules', 0, 'externalScheduleConfigArgs'))
      user = Client.find(params[:project_id]).end_users.find_by!(email: response['userEmailAddress'])

      user_assessment = user.user_assessments.find_by!(
        campaign_id: schedule_config['campaign_id'], assessment_id: schedule_config['assessment_id']
      )
      user_assessment.complete! unless user_assessment.completed?
      ::Iiht::SaveScores.call!(user_assessment, response)

      head :ok
    end
  end
end
