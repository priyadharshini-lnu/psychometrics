# frozen_string_literal: true

require 'rails_helper'
require 'axlsx'

RSpec.describe CampaignFactors::Export do
  describe '#call' do
    let(:campaign) { create(:campaign) }
    let(:campaign_factor_group) { create(:campaign_factor_group, campaign: campaign) }
    let!(:campaign_factor) do
      create(:campaign_factor,
             campaign: campaign,
             campaign_factor_group: campaign_factor_group,
             position: 1,
             name: 'Overall score',
             code: 'overall_score',
             description: 'Description',
             factor_type: 'formula',
             output_type: 'numeric',
             factor_id: nil,
             assessment_id: nil,
             sheet_column_name: nil,
             assessment_score_type: 'norm_score',
             formula: 'return __overall_assessor_score + __overall_online_score',
             ranked: false,
             public_visibility: true)
    end

    subject(:export_data) { described_class.call!(campaign) }

    it 'creates an Excel file with correct headers and campaign factor details' do
      expect { export_data }.to broadcast(:ok)

      package = export_data
      sheet = package.workbook.worksheets.first
      headers = sheet.rows.first.cells.map(&:value)
      first_row_values = sheet.rows.second.cells.map(&:value)

      expect(headers).to eq(CampaignFactors::Export::ALLOWED_HEADERS)
      expect(first_row_values).to eq([
        campaign_factor.position,
        campaign_factor.name,
        campaign_factor.code,
        campaign_factor.description,
        campaign_factor.factor_type,
        campaign_factor.output_type,
        campaign_factor.factor_id,
        campaign_factor.assessment_id,
        campaign_factor.sheet_column_name,
        campaign_factor.assessment_score_type,
        campaign_factor.formula,
        (campaign_factor.ranked ? 1 : 0),
        (campaign_factor.public_visibility ? 1 : 0),
        campaign_factor.campaign_factor_group.name,
        campaign_factor.min_value,
        campaign_factor.max_value,
        (campaign_factor.is_na_allowed ? 1 : 0),
        (campaign_factor.disallow_lead_assessor_moderation ? 1 : 0)
      ])
    end
  end
end
