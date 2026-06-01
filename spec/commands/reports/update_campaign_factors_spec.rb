# frozen_string_literal: true

require 'rails_helper'

describe Reports::UpdateCampaignFactors do
  describe '#call' do
    let(:report) { create(:report) }

    let(:existing_factors) do
      [
        create(:report_campaign_factor, report: report, code: 'factor1', name: 'Factor 1', output_type: 'numeric'),
        create(:report_campaign_factor, report: report, code: 'factor2', name: 'Factor 2', output_type: 'numeric')
      ]
    end

    before do
      existing_factors
    end

    context 'with valid parameters' do
      it 'updates existing factors and creates new ones' do
        new_factors_params = [
          { 'code' => 'factor1', 'name' => 'Updated Factor 1', 'output_type' => 'numeric' },
          { 'code' => 'factor3', 'name' => 'New Factor 3', 'output_type' => 'string' }
        ]

        described_class.call(report, new_factors_params)

        expect(report.reload.campaign_factors.count).to eq(new_factors_params.length)

        updated_factor = report.campaign_factors.find_by(code: 'factor1')
        new_factor = report.campaign_factors.find_by(code: 'factor3')

        expect(report.campaign_factors.find_by(code: 'factor2')).to be_nil
        expect(updated_factor).to have_attributes(
          name: 'Updated Factor 1',
          output_type: 'numeric'
        )
        expect(new_factor).to have_attributes(
          name: 'New Factor 3',
          output_type: 'string'
        )
      end

      it 'sets tenant_id from the report on imported factors' do
        tenant = create(:tenancy)
        report.update_column(:tenant_id, tenant.id)
        new_factors_params = [
          { 'code' => 'factor_new', 'name' => 'Tenanted Factor', 'output_type' => 'numeric' }
        ]

        described_class.call(report, new_factors_params)

        new_factor = report.campaign_factors.find_by(code: 'factor_new')
        expect(new_factor.tenant_id).to eq(tenant.id)
      end

      it 'removes all factors when empty array is provided' do
        described_class.call(report, [])

        expect(report.reload.campaign_factors.count).to eq(0)
        expect(report.campaign_factors.find_by(code: 'factor1')).to be_nil
        expect(report.campaign_factors.find_by(code: 'factor2')).to be_nil
      end

      it 'updates campaign factor codes in report modules' do
        new_factors_params = [
          { 'code' => 'factor1', 'name' => 'Updated Factor 1', 'output_type' => 'numeric' }
        ]

        props = { 'source' => { 'type' => 'CampaignFactors', 'codes' => %w[factor1 factor2] } }
        page = create(:page, report: report)
        create(:module, page: page, props: props)

        described_class.call(report, new_factors_params)

        report_module = report.modules.first
        expect(report_module.props['source']['codes']).to eq(['factor1'])
      end
    end

    context 'with invalid parameters' do
      it 'raises error when params is not an array' do
        invalid_params = { 'some' => 'data' }

        expect do
          described_class.call(report, invalid_params)
        end.to raise_error(described_class::InvalidFactorParams)
      end

      it 'raises error when factor params are missing required fields' do
        invalid_params = [{ 'code' => 'factor1' }] # missing name and output_type

        expect do
          described_class.call(report, invalid_params)
        end.to raise_error(described_class::InvalidFactorParams)
      end
    end
  end
end
