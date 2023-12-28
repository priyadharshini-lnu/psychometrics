# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::CampaignFactorsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let!(:campaign_factor_group) { create(:campaign_factor_group, campaign_id: campaign_id) }
  let(:campaign_factor_group_id) { campaign_factor_group.id.to_s }
  let!(:campaign_factor) do
    create(
      :campaign_factor,
      name: 'Factor', campaign_factor_group_id: campaign_factor_group_id, campaign_id: campaign_id
    )
  end
  let(:factor_id) { campaign_factor.id.to_s }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/campaigns/{campaign_id}/campaign_factor_groups/{campaign_factor_group_id}/campaign_factors' do
    get 'CampaignFactors List' do
      operationId 'CampaignFactors'
      description 'Fetch campaign Factor list'
      tags 'Campaign Factor Scoring'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :campaign_factor_group_id, in: :path, type: :string

      response '200', 'Campaign factor list' do
        schema '$ref' => '#/components/schemas/CampaignFactorListResponse'

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'campaign_factors',
            attributes: {
              name: 'Factor', position: 1
            },
            relationships: {
              campaign: { data: { type: 'campaigns', id: 1 } }
            }
          }]
        }

        run_test! do |response|
          cf = JSON.parse(response.body)['data'].first
          expect(cf).to have_attribute(:name).with_value('Factor')
          expect(cf).to have_relationship(:campaign).with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
          expect(cf).to have_relationship(:campaign_factor_group).
            with_data({ 'id' => campaign_factor_group_id, 'type' => 'campaign_factor_groups' })
        end
      end
    end

    post 'Create CampaignFactor' do
      operationId 'CreateCampaignFactors'
      description 'Create campaign Factor list'
      tags 'Campaign Factor Scoring'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :campaign_factor_group_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/CampaignFactorCreateRequest' },
                required: true

      response '201', 'Create campaign factor' do
        schema '$ref' => '#/components/schemas/CampaignFactorResponse'

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'campaign_factors',
            attributes: {
              name: 'Factor', position: 1, campaign_factor_group_id: 1, code: 'factor_code'
            },
            relationships: {
              campaign: { data: { type: 'campaigns', id: 1 } },
              campaign_factor_group: { data: { type: 'campaign_factor_groups', id: 1 } }
            }
          }]
        }

        let(:body) do
          {
            data: {
              type: 'campaign_factors',
              attributes: {
                name: 'Factor', position: 1, campaign_factor_group_id: campaign_factor_group_id.to_i, code: 'fact_code'
              },
              relationships: {
                campaign: { data: { type: 'campaigns', id: campaign_id.to_s } },
                campaign_factor_group: { data: { type: 'campaign_factor_groups', id: campaign_factor_group_id } }
              }
            }
          }
        end

        run_test! do |response|
          cf = JSON.parse(response.body)['data']
          expect(cf).to have_key('id')
          expect(cf).to have_attribute(:name).with_value('Factor')
          expect(cf).to have_relationship(:campaign).with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
          expect(cf).to have_relationship(:campaign_factor_group).
            with_data({ 'id' => campaign_factor_group_id, 'type' => 'campaign_factor_groups' })
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/campaign_factor_groups/{campaign_factor_group_id}/campaign_factors/{factor_id}' do
    patch 'Update CampaignFactor' do
      operationId 'UpdateCampaignFactors'
      description 'Update campaign Factor'
      tags 'Campaign Factor Scoring'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :campaign_factor_group_id, in: :path, type: :string
      parameter name: :factor_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/CampaignFactorCreateRequest' },
                required: true

      response '200', 'Update campaign factor' do
        schema '$ref' => '#/components/schemas/CampaignFactorResponse'

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'campaign_factors',
            attributes: {
              name: 'Updated Factor name', position: 1
            },
            relationships: {
              campaign: { data: { type: 'campaigns', id: 1 } }
            }
          }]
        }

        let(:body) do
          {
            data: {
              type: 'campaign_factors',
              id: factor_id,
              attributes: {
                name: 'Updated Factor name', position: 2
              },
              relationships: {
                campaign: { data: { type: 'campaigns', id: campaign_id.to_s } }
              }
            }
          }
        end

        run_test! do |response|
          cf = JSON.parse(response.body)['data']
          expect(cf).to have_key('id')
          expect(cf).to have_attribute(:name).with_value('Updated Factor name')
          expect(cf).to have_attribute(:position).with_value(2)
          expect(cf).to have_relationship(:campaign).with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
          expect(cf).to have_relationship(:campaign_factor_group).
            with_data({ 'id' => campaign_factor_group_id, 'type' => 'campaign_factor_groups' })
        end
      end
    end

    delete 'Delete CampaignFactor' do
      operationId 'DeleteCampaignFactors'
      description 'Delete campaign Factor list'
      tags 'Campaign Factor Scoring'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :campaign_factor_group_id, in: :path, type: :string
      parameter name: :factor_id, in: :path, type: :string

      response '204', 'Delete campaign factor' do
        run_test! do |response|
          expect(response.body).to eq('')
          expect(CampaignFactor.find_by(id: campaign_factor_group_id)).to eq nil
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/campaign_factor_groups/{campaign_factor_group_id}/campaign_factors/update_positions' do
    post 'Update CampaignFactor positions' do
      operationId 'UpdateCampaignFactors'
      description 'Update campaign Factor positions'
      tags 'Campaign Factor Scoring'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :campaign_factor_group_id, in: :path, type: :string
      parameter name: :body, in: :body, required: true

      response '200', 'Update campaign factor positions' do
        examples 'application/json' => {
          data: [{
            type: 'campaign_factors',
            id: 1,
            attributes: { position: 1 }
          }]
        }

        let!(:another_factor) { create(:campaign_factor, name: 'Factor 2', campaign_id: campaign_id) }
        let(:new_position) { 5 }
        let(:body) do
          {
            data: [
              {
                type: 'campaign_factors',
                id: factor_id,
                attributes: { position: new_position }
              },
              {
                type: 'campaign_factors',
                id: another_factor.id,
                attributes: { position: new_position + 1 }
              }
            ]
          }
        end

        run_test! do |response|
          cf = JSON.parse(response.body)['data'].first
          expect(cf).to have_key('id')
          expect(cf).to have_attribute(:name).with_value('Factor')
          expect(cf).to have_attribute(:position).with_value(5)
          expect(CampaignFactor.find(another_factor.id).position).to eq(6)
          expect(cf).to have_relationship(:campaign).with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
          expect(cf).to have_relationship(:campaign_factor_group).
            with_data({ 'id' => campaign_factor_group_id, 'type' => 'campaign_factor_groups' })
        end
      end
    end
  end
end
