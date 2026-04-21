# frozen_string_literal: true

module Administration
  module Campaigns
    class UniversalLinksController < Administration::Campaigns::BaseController
      def show
        universal_link = assessment.decorate.anonym_link_for_campaign(campaign)
        type = params[:type]
        file = QrCode::Create.call!(universal_link, type)
        respond_to do |format|
          format.svg { send_data file.read, filename: format(assessment.name, 'svg') }
          format.png { send_data file.read, filename: format(assessment.name, 'png') }
        end
      end

      def enable
        campaign_assessment = ::Assessments::UniversalLink::Enable.call!(campaign, assessment)
        audit! :enable_universal_link, campaign_assessment,
               payload: { campaign_id: campaign.id, assessment_id: assessment.id },
               campaign: campaign
        render json: ::Administration::CampaignAssessmentSerializer.new(
          context: {
            current_user: current_user,
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        ).serialize(campaign_assessment)
      end

      def update
        campaign_assessment = ::Assessments::UniversalLink::Update.call!(campaign, assessment, params)
        render json: ::Administration::CampaignAssessmentSerializer.new(
          context: {
            current_user: current_user,
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        ).serialize(campaign_assessment)
      end

      def regenerate
        campaign_assessment = ::Assessments::UniversalLink::Generate.call!(campaign, assessment)
        audit! :regenerate_universal_link, campaign_assessment,
               payload: { campaign_id: campaign.id, assessment_id: assessment.id },
               campaign: campaign
        render json: ::Administration::CampaignAssessmentSerializer.new(
          context: {
            current_user: current_user,
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        ).serialize(campaign_assessment)
      end

      private

      def format(name, type)
        file_name = name.downcase.split(/\s|-|_/).compact_blank.join('_')
        "qr_code_#{file_name}.#{type}"
      end

      def resource_class
        CampaignAssessment
      end

      def pundit_authorize
        authorize(
          resource || User,
          nil,
          policy_class: Campaigns::UniversalLinkPolicy,
          project_id: campaign.project_id,
          campaign_id: campaign.id
        )
      end

      def assessment
        @assessment ||= campaign.campaign_assessments.find_by(assessment_id: params[:id])&.assessment
      end
    end
  end
end
