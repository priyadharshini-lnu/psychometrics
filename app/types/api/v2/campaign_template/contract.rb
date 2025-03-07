# frozen_string_literal: true

module Api
  module V2
    module CampaignTemplate
      class Contract < Api::Base::Contract
        schema Api::V2::CampaignTemplate::Schema.create_request

        rule(data: { relationships: :owner }) do
          assessment_id = values.dig(:data, :relationships, :assessment, :data, :id)
          report_id = values.dig(:data, :relationships, :report, :data, :id)
          template_owner_id = values.dig(:data, :relationships, :owner, :data, :id)
          template_owner_id = template_owner_id&.to_i

          assessment = ::Assessment.find(assessment_id)
          report = ::Report.find(report_id)

          unless [assessment.owner_id, assessment.dimension.owner_id, report.owner_id].all?(template_owner_id)
            key.failure(I18n.t('administration.campaign_templates.errors.owner_invalid'))
          end
        end
      end
    end
  end
end
