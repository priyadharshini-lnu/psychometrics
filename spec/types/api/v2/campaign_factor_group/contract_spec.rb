# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::CampaignFactorGroup::Contract do
  let(:user) { create(:user) }
  let!(:campaign) { create(:campaign) }
  let!(:assessment) { create(:assessment) }
  let(:valid_params) do
    jsonapi_resource_request(
      'campaign_factor_groups',
      {
        name: 'Group', position: 1, campaign_id: campaign.id.to_s
      },
      {
        campaign: { type: 'campaigns', id: campaign.id.to_s }
      }
    )
  end

  it 'validates name' do
    params = jsonapi_merge_attributes(valid_params, { name: '' })
    contract = Api::V2::CampaignFactorGroup::Contract.new.call(params, { current_user: user, params: params })

    expect(contract.failure?).to eq(true)
    expect(contract).to have_jsonapi_attr_error(
      name: ["can't be blank"]
    )
  end

  it 'validates presence duplicate name while creating new group' do
    create(:campaign_factor_group, campaign: campaign, name: 'Group')
    params = jsonapi_merge_attributes(valid_params, { name: 'Group' }).merge(campaign_id: campaign.id)
    contract = Api::V2::CampaignFactorGroup::Contract.new.call(params, { current_user: user, params: params })

    expect(contract.failure?).to eq(true)
    expect(contract).to have_jsonapi_attr_error(
      name: ['A group with the same name already exists.']
    )
  end

  it 'validates presence duplicate name while updating existing group' do
    group_one = create(:campaign_factor_group, campaign: campaign, name: 'Group one')
    create(:campaign_factor_group, campaign: campaign, name: 'Group two')
    params = jsonapi_merge_attributes(valid_params, { name: 'Group two', id: group_one.id }).merge(
      campaign_id: campaign.id
    )
    contract = Api::V2::CampaignFactorGroup::Contract.new.call(params, { current_user: user, params: params })

    expect(contract.failure?).to eq(true)
    expect(contract).to have_jsonapi_attr_error(
      name: ['A group with the same name already exists.']
    )
  end

  it 'does not consider current group name for checking duplicates while editing a group' do
    group_one = create(:campaign_factor_group, campaign: campaign, name: 'Group one')
    params = jsonapi_merge_attributes(valid_params, { name: 'Group one', id: group_one.id }).merge(
      campaign_id: campaign.id
    )
    contract = Api::V2::CampaignFactorGroup::Contract.new.call(params, { current_user: user, params: params })

    expect(contract.failure?).to eq(true)
    expect(contract).to have_jsonapi_attr_error(
      name: ['A group with the same name already exists.']
    )
  end

  it 'allows duplicate name accross different campaigns' do
    campaign_one = create(:campaign)
    create(:campaign_factor_group, campaign: campaign, name: 'Group two')
    params = jsonapi_merge_attributes(valid_params, { name: 'Group two' }).merge(campaign_id: campaign_one.id)
    contract = Api::V2::CampaignFactorGroup::Contract.new.call(params, { current_user: user, params: params })

    expect(contract.failure?).to eq(false)
  end
end
