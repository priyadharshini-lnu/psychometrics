# frozen_string_literal: true

module Api::V2::DataReport
  module TypesForms
    class CampaignScoreForm < BaseForm
      attribute :factor_code

      validates :factor_code, presence: true
      validate :factor_is_related_to_client

      def factor_is_related_to_client
        campaign_ids = context[:campaign_ids] ||
                       Project.where(id: context[:project_ids]).map(&:project_campaign_ids).flatten

        factor = CampaignFactor.find_by(code: factor_code, campaign_id: campaign_ids)

        return errors.add(:factor_code, I18n.t('administration.data_reports.errors.not_found')) if factor.nil?

        if factor.campaign.client.id != context[:client_id]
          errors.add(:factor_code, I18n.t('administration.data_reports.errors.not_owned'))
        end
      end
    end
  end
end
