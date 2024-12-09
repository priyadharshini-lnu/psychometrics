# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Campaigns::ExternalCampaignScoresImport::ProcessRows do
  let(:campaign) { create(:campaign) }
  let!(:campaign_factor1) do
    create(:campaign_factor, factor_type: :external_score, code: 'ext_code1', campaign: campaign)
  end
  let!(:campaign_factor2) do
    create(:campaign_factor, factor_type: :external_score, code: 'ext_code2', campaign: campaign)
  end

  describe '#call' do
    let(:rows) do
      [{ 'Email' => 'user@example.com', 'ext_code1' => '60', 'ext_code2' => '71' }]
    end

    it 'transforms rows into an array of hashes with id' do
      result = described_class.call!(rows, campaign)

      expect(result.size).to eq(1)

      expected_hash = {
        'email' => 'user@example.com',
        'factor_values' => {
          campaign_factor1.id => '60',
          campaign_factor2.id => '71'
        }
      }

      expect(result.first).to eq(expected_hash)
    end
  end
end
