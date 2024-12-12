# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::CampaignFactorsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let!(:dimension) { create(:dimension) }
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

  path '/campaigns/{campaign_id}/campaign_factors' do
    get 'CampaignFactors List' do
      operationId 'CampaignFactors'
      description 'Fetch campaign Factor list'
      tags 'Campaign Factor Scoring'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string

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
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/CampaignFactorCreateRequest' },
                required: true

      response '201', 'Create campaign factor' do
        schema '$ref' => '#/components/schemas/CampaignFactorResponse'

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'campaign_factors',
            attributes: {
              name: 'Factor', factor_type: 'formula', public_visibility: true, position: 1, campaign_factor_group_id: 1,
              code: 'factor_code'
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
                name: 'Factor two', position: 2, campaign_factor_group_id: campaign_factor_group_id.to_i,
                code: 'fact_code', factor_type: 'formula', public_visibility: true, output_type: 'numeric'
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
          expect(cf).to have_attribute(:name).with_value('Factor two')
          expect(cf).to have_relationship(:campaign).with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
          expect(cf).to have_relationship(:campaign_factor_group).
            with_data({ 'id' => campaign_factor_group_id, 'type' => 'campaign_factor_groups' })
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/campaign_factors/{factor_id}' do
    patch 'Update CampaignFactor' do
      operationId 'UpdateCampaignFactors'
      description 'Update campaign Factor'
      tags 'Campaign Factor Scoring'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
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
              name: 'Factor', factor_type: 'formula', public_visibility: true, position: 1, campaign_factor_group_id: 1,
              code: 'factor_code', output_type: 'numeric'
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
              id: factor_id,
              attributes: {
                name: 'Updated Factor name', factor_type: 'formula', public_visibility: true, position: 2,
                campaign_factor_group_id: campaign_factor_group_id.to_i, code: 'factor_code', output_type: 'numeric'
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
      parameter name: :factor_id, in: :path, type: :string

      response '204', 'Delete campaign factor' do
        run_test! do |response|
          expect(response.body).to eq('')
          expect(CampaignFactor.find_by(id: campaign_factor_group_id)).to eq nil
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/campaign_factors/update_positions' do
    post 'Update CampaignFactor positions' do
      operationId 'UpdateCampaignFactors'
      description 'Update campaign Factor positions'
      tags 'Campaign Factor Scoring'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body, required: true

      response '200', 'Update campaign factor positions' do
        examples 'application/json' => {
          data: [{
            type: 'campaign_factors',
            id: 1,
            attributes: { position: 1 }
          }]
        }

        let!(:second_factor_group) { create(:campaign_factor_group, campaign_id: campaign_id) }
        let!(:second_factor) { create(:campaign_factor, name: 'Factor 2', campaign_id: campaign_id) }
        let(:body) do
          {
            data: [
              {
                type: 'campaign_factors',
                id: factor_id,
                attributes: { position: 2, campaign_factor_group_id: second_factor_group.id }
              },
              {
                type: 'campaign_factors',
                id: second_factor.id,
                attributes: { position: 3, campaign_factor_group_id: campaign_factor_group_id }
              }
            ]
          }
        end

        run_test! do |response|
          cf = JSON.parse(response.body)['data'].first
          expect(cf).to have_key('id')
          expect(cf).to have_attribute(:name).with_value('Factor')
          expect(cf).to have_attribute(:position).with_value(2)
          expect(cf).to have_attribute(:campaign_factor_group_id).with_value(second_factor_group.id)
          expect(CampaignFactor.find(second_factor.id).position).to eq(3)
          expect(CampaignFactor.find(second_factor.id).campaign_factor_group_id).to eq(campaign_factor_group.id)
          expect(cf).to have_relationship(:campaign).with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
          expect(cf).to have_relationship(:campaign_factor_group).
            with_data({ 'id' => second_factor_group.id.to_s, 'type' => 'campaign_factor_groups' })
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/campaign_factors/remove_all' do
    post 'Remove all CampaignFactors' do
      operationId 'RemoveAllCampaignFactors'
      description 'Remove all campaign Factors'
      tags 'Campaign Factor Scoring'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body, required: true

      response '200', 'remove all campaign factors' do
        examples 'application/json' => {
          data: [{
            type: 'campaign_factors',
            id: 1
          }]
        }

        run_test! do |_response|
          expect(campaign.campaign_factors).to be_empty
          expect(campaign.campaign_factor_groups).to be_empty
        end
      end
    end
  end

  describe 'import' do
    it 'queues import_campaign_factors job successfully' do
      file = Rack::Test::UploadedFile.new(
        Rails.root.join('spec/fixtures/files/import_campaign_factors/valid_file.xlsx'), 'application/xlsx'
      )

      post "/api/v2/administration/campaigns/#{campaign.id}/campaign_factors/import", params: { file: file }

      expect(AdminJobRecord.exists?(operation: 'import_campaign_factors')).to be_truthy
    end

    it 'returns validation error' do
      file = Rack::Test::UploadedFile.new(
        Rails.root.join('spec/fixtures/files/import_campaign_factors/invalid_rows.xlsx'), 'application/xlsx'
      )

      post "/api/v2/administration/campaigns/#{campaign.id}/campaign_factors/import", params: { file: file }

      expect(response).to have_http_status(422)
    end
  end
end
