# frozen_string_literal: true

module Pearson
  class CreateSchedule < Base
    include Rails.application.routes.url_helpers

    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      response = client.post('v1/schedules', request_data.to_json)
      parsed_response = ::JSON.parse(response.body)['data']
      schedule_id = parsed_response['scheduleId']
      url = parsed_response.dig('urls', 0, 'url')

      user_assessment.pearson_user_assessment.update!(schedule_id: schedule_id, url: url)

      broadcast :ok
    end

    private

    def request_data
      {
        products: [
          {
            productId: user_assessment.assessment.external_settings[:assessment_id],
            norms: [user_assessment.pearson_norm_id],
            languageCode: user_assessment.pearson_assessment_language,
            canOverrideLanguage: true
          }
        ],
        candidates: [
          {
            candidateId: user_assessment.subject.id.to_s,
            tags: [
              {
                key: 'GivenName',
                value: user_assessment.subject.first_name
              },
              {
                key: 'FamilyName',
                value: user_assessment.subject.last_name
              }
            ]
          }
        ],
        tags: [
          {
            key: 'EndingPageCallbackUrl',
            value: redirect_url
          }
        ]
      }
    end

    def redirect_url
      redirect_pearson_user_assessment_url(user_assessment.id, {
        host: Settings.domain,
        subdomain: user_assessment.project.subdomain,
        protocol: Settings.protocol,
        port: Settings.port
      })
    end
  end
end
