# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CampaignFactors::ValidateDelete do
  let(:campaign) { create(:campaign) }
  let(:campaign_factor) { create(:campaign_factor, campaign: campaign, factor_type: factor_type) }

  describe '#call' do
    context 'when manual campaign factor exists' do
      let!(:manual_campaign_factor_value) do
        create(:campaign_factor_value, campaign_factor: campaign_factor, calculation_type: 'manual')
      end

      context 'when factor type is assessor_scoring' do
        let(:factor_type) { 'assessor_scoring' }

        it 'broadcasts ok with warning message' do
          result = described_class.call!(campaign, campaign_factor.id)

          expect(result).to eq(I18n.t('administration.campaign_factors.delete.confirm_message.assessor_scoring',
                                      factor_name: campaign_factor.name))
        end
      end

      context 'when factor type is external_score' do
        let(:factor_type) { 'external_score' }

        it 'broadcasts ok with warning message' do
          result = described_class.call!(campaign, campaign_factor.id)
          expect(result).to eq(I18n.t('administration.campaign_factors.delete.confirm_message.external_score',
                                      factor_name: campaign_factor.name))
        end
      end

      context 'when factor type is other' do
        let(:factor_type) { 'assessment' }

        it 'broadcasts ok with default warning message' do
          result = described_class.call!(campaign, campaign_factor.id)
          expect(result).to eq(I18n.t('administration.campaign_factors.delete.confirm_message.default',
                                      factor_name: campaign_factor.name))
        end
      end
    end

    context 'when manual campaign factor not exists' do
      let(:factor_type) { 'assessor_scoring' }

      it 'broadcasts ok with default warning message' do
        result = described_class.call!(campaign, campaign_factor.id)

        expect(result).to eq(I18n.t('administration.campaign_factors.delete.confirm_message.default',
                                    factor_name: campaign_factor.name))
      end
    end
  end
end
