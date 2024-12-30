# frozen_string_literal: true

module CampaignFactors
  class ValidateDelete < BaseCommand
    private_attr_accessor :campaign, :campaign_factor_id

    def initialize(campaign, campaign_factor_id)
      @campaign = campaign
      @campaign_factor_id = campaign_factor_id
    end

    def call
      return broadcast(:error) unless campaign_factor

      if manual_campaign_factor_exists?
        return broadcast(:ok, warning_message)
      end

      broadcast(:ok,
                I18n.t('administration.campaign_factors.delete.confirm_message.default',
                       factor_name: campaign_factor.name))
    end

    private

    def manual_campaign_factor_exists?
      campaign_factor.campaign_factor_values.exists?(calculation_type: :manual)
    end

    def campaign_factor
      @campaign_factor ||= campaign.campaign_factors.find_by(id: campaign_factor_id)
    end

    def warning_message
      case campaign_factor.factor_type
        when 'assessor_scoring'
          I18n.t('administration.campaign_factors.delete.confirm_message.assessor_scoring',
                 factor_name: campaign_factor.name)
        when 'external_score'
          I18n.t('administration.campaign_factors.delete.confirm_message.external_score',
                 factor_name: campaign_factor.name)
        else
          I18n.t('administration.campaign_factors.delete.confirm_message.default', factor_name: campaign_factor.name)
      end
    end
  end
end
