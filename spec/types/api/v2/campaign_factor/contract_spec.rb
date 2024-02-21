# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::CampaignFactor::Contract do
  let(:user) { create(:user) }
  let!(:campaign) { create(:campaign) }
  let!(:campaign_factor_group) { create(:campaign_factor_group, campaign: campaign) }
  let!(:factor) { create(:factor) }
  let!(:assessment) { create(:assessment) }
  let(:valid_params) do
    jsonapi_resource_request(
      'campaign_factors',
      {
        name: 'Factor', code: 'factor', output_type: 'numeric', public_visibility: true, position: 1,
        factor_type: 'assessment', assessment_id: assessment.id.to_s, factor_id: factor.id.to_s,
        campaign_id: campaign.id.to_s, assessment_score_type: 'norm_score'
      },
      {
        campaign_factor_group: { type: 'campaign_factor_groups', id: campaign_factor_group.id.to_s },
        campaign: { type: 'campaigns', id: campaign.id.to_s }
      }
    )
  end

  it 'validates name' do
    params = jsonapi_merge_attributes(valid_params, { name: '' })
    contract = Api::V2::CampaignFactor::Contract.new.call(params, { current_user: user, params: params })

    expect(contract.failure?).to eq(true)
    expect(contract).to have_jsonapi_attr_error(
      name: ["can't be blank"]
    )
  end

  it 'validates assessment type with filled assessment' do
    params = jsonapi_merge_attributes(valid_params, { assessment_id: nil })
    contract = Api::V2::CampaignFactor::Contract.new.call(params, { current_user: user, params: params })

    expect(contract.failure?).to eq(true)
    expect(contract).to have_jsonapi_attr_error(
      assessment_id: ["can't be blank"]
    )
  end

  it 'validates factor id' do
    params = jsonapi_merge_attributes(valid_params, { factor_id: nil })
    contract = Api::V2::CampaignFactor::Contract.new.call(params, { current_user: user, params: params })

    expect(contract.failure?).to eq(true)
    expect(contract).to have_jsonapi_attr_error(
      factor_id: ["can't be blank"]
    )
  end

  it 'passes if all params are valid' do
    contract = Api::V2::CampaignFactor::Contract.new.call(
      valid_params, { current_user: user, params: valid_params }
    )

    expect(contract.failure?).to eq(false)
  end

  it 'validates if same name already exists while creating a new factor' do
    create(:campaign_factor, campaign: campaign, campaign_factor_group: campaign_factor_group, name: 'Factor')
    params = jsonapi_merge_attributes(valid_params, { name: 'Factor' }).merge(campaign_id: campaign.id.to_s)
    contract = Api::V2::CampaignFactor::Contract.new.call(params, { current_user: user, params: params })

    expect(contract.failure?).to eq(true)
    expect(contract).to have_jsonapi_attr_error(
      name: ['should be unique']
    )
  end

  it 'validates if same name already exists while updating a existing factor' do
    campaign_factor_one = create(:campaign_factor, campaign: campaign, campaign_factor_group: campaign_factor_group,
    name: 'Factor one')
    create(:campaign_factor, campaign: campaign, campaign_factor_group: campaign_factor_group, name: 'Factor two')
    params = jsonapi_merge_attributes(valid_params, { name: 'Factor two', id: campaign_factor_one.id }).merge(
      campaign_id: campaign.id.to_s
    )
    contract = Api::V2::CampaignFactor::Contract.new.call(params, { current_user: user, params: params })

    expect(contract.failure?).to eq(true)
    expect(contract).to have_jsonapi_attr_error(
      name: ['should be unique']
    )
  end

  it 'validates if same name already exists only within same campaign' do
    campaign_two = create(:campaign)
    create(:campaign_factor, campaign: campaign, campaign_factor_group: campaign_factor_group, name: 'Factor')
    # create(:campaign_factor, campaign: campaign, campaign_factor_group: campaign_factor_group, name: 'Factor')
    params = jsonapi_merge_attributes(valid_params, { name: 'Factor', campaign: campaign_two }).merge(
      campaign_id: campaign_two.id.to_s
    )
    contract = Api::V2::CampaignFactor::Contract.new.call(params, { current_user: user, params: params })

    expect(contract.failure?).to eq(false)
  end
end
