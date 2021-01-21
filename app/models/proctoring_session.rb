# frozen_string_literal: true

class ProctoringSession < ApplicationRecord
  belongs_to :campaign_user

  def payloadify
    end_date = campaign_user.started_at + campaign.fixed_time_duration.minutes
    {
      "userId": campaign_user.id.to_s,
      "lastName": campaign_user.user.first_name,
      "firstName": campaign_user.user.last_name,
      "thirdName": '',
      "language": 'en',
      "accountId": project.project.id,
      "accountName": project.name,
      "examId": campaign.id.to_s,
      "courseName": '',
      "examName": campaign.name,
      "duration": campaign.fixed_time_duration,
      "schedule": false,
      "proctoring": 'offline',
      "identification": campaign.identification,
      "rules": campaign.rules,
      "startDate": campaign_user.started_at.iso8601,
      "endDate": end_date.iso8601,
      "sessionId": session_id,
      "sessionUrl": session_url
    }
  end

  def session_url
    options = {
      host: Settings.domain,
      subdomain: project&.subdomain,
      protocol: Settings.protocol,
      proctoring: :in_progress
    }

    options[:port] = Settings.port if Rails.env.development?

    Rails.application.routes.url_helpers.campaign_url(campaign, options)
  end

  private

  def campaign
    campaign_user&.campaign
  end

  def project
    campaign_user&.campaign&.project
  end
end
