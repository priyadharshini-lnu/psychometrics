# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::CampaignTemplate::Contract do
  let(:user) { create(:user) }
  let(:owner) { create(:tenancy) }
  let!(:assessment) { create(:assessment, :with_same_owner_dimension, owner:, skip_owner_validation: true) }
  let!(:report) { create(:report, owner:, skip_owner_validation: true) }

  let(:valid_params) do
    {
      data: {
        id: '5',
        type: 'campaign_templates',
        attributes: {
          name: 'Template Name'
        },
        relationships: {
          owner: { data: { type: 'clients', id: owner.id.to_s } },
          assessment: { data: { type: 'assessments', id: assessment.id.to_s } },
          report: { data: { type: 'reports', id: report.id.to_s } }
        }
      }
    }
  end

  it 'validates owner matches assessment, dimension, and report owners' do
    params = valid_params.deep_merge({
      data: {
        relationships: {
          owner: { data: { type: 'clients', id: '100' } }
        }
      }
    })

    contract = Api::V2::CampaignTemplate::Contract.new.call(params, { current_user: user, params: params })

    expect(contract.failure?).to eq(true)
    error_message = I18n.t('administration.campaign_templates.errors.owner_invalid')
    expect(contract.errors.to_h.dig(:data, :relationships, :owner)).to include(error_message)
  end

  it 'validates no error when owners match' do
    contract = Api::V2::CampaignTemplate::Contract.new.call(valid_params, { current_user: user, params: valid_params })

    expect(contract.failure?).to eq(false)
  end
end
