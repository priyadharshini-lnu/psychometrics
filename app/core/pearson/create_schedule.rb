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
      subject = user_assessment.subject
      maskable_identity = subject.maskable_identity(
        mask: user_assessment.project.mask_identity_for_pearson?
      )
      product = {
        productId: user_assessment.assessment.external_assessment_id,
        canOverrideLanguage: true
      }
      unless user_assessment.assessment.v2_pearson_assessment?
        product = product.merge(norms: [user_assessment.pearson_norm_id])
      end
      pearson_assessment_language = user_assessment.pearson_assessment_language
      product = product.merge(languageCode: pearson_assessment_language) if pearson_assessment_language
      {
        products: [product],
        candidates: [
          {
            candidateId: subject.id.to_s,
            tags: [
              {
                key: 'GivenName',
                value: maskable_identity.first_name
              },
              {
                key: 'FamilyName',
                value: maskable_identity.last_name
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
