# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::CampaignFactorGroupsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let!(:campaign_factor_group) { create(:campaign_factor_group, name: 'Test group', campaign_id: campaign_id) }
  let(:campaign_factor_group_id) { campaign_factor_group.id.to_s }
  let!(:campaign_factors) do
    create(:campaign_factor, campaign_factor_group: campaign_factor_group, public_visibility: true)
  end
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/campaigns/{campaign_id}/campaign_factor_groups' do
    get 'CampaignFactorGroups List' do
      operationId 'CampaignFactorGroups'
      description 'Fetch campaign Factor Group list'
      tags 'Campaign Factor Scoring'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string

      response '200', 'Campaign factor group list' do
        schema '$ref' => '#/components/schemas/CampaignFactorGroupListResponse'

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'campaign_factor_groups',
            attributes: {
              name: 'Test group', position: 1
            },
            relationships: {
              campaign: { data: { type: 'campaigns', id: 1 } }
            }
          }]
        }

        run_test! do |response|
          cfg = JSON.parse(response.body)['data'].first
          expect(cfg).to have_attribute(:name).with_value('Test group')
          expect(cfg).to have_relationship(:campaign).
            with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
        end
      end
    end

    post 'Create CampaignFactorGroup' do
      operationId 'CreateCampaignFactorGroups'
      description 'Create campaign Factor Group list'
      tags 'Campaign Factor Scoring'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/CampaignFactorGroupCreateRequest' },
                required: true

      response '201', 'Create campaign factor group' do
        schema '$ref' => '#/components/schemas/CampaignFactorGroupResponse'

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'campaign_factor_groups',
            attributes: {
              name: 'Test group', position: 1
            },
            relationships: {
              campaign: { data: { type: 'campaigns', id: 1 } }
            }
          }]
        }

        let(:body) do
          {
            data: {
              type: 'campaign_factor_groups',
              attributes: {
                name: 'Test group two', position: 2
              },
              relationships: {
                campaign: { data: { type: 'campaigns', id: campaign_id.to_s } }
              }
            }
          }
        end

        run_test! do |response|
          cfg = JSON.parse(response.body)['data']
          expect(cfg).to have_key('id')
          expect(cfg).to have_attribute(:name).with_value('Test group two')
          expect(cfg).to have_relationship(:campaign).
            with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/campaign_factor_groups/{campaign_factor_group_id}' do
    patch 'Update CampaignFactorGroup' do
      operationId 'UpdateCampaignFactorGroups'
      description 'Update campaign Factor Group'
      tags 'Campaign Factor Scoring'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :campaign_factor_group_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/CampaignFactorGroupCreateRequest' },
                required: true

      response '200', 'Update campaign factor group' do
        schema '$ref' => '#/components/schemas/CampaignFactorGroupResponse'

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'campaign_factor_groups',
            attributes: {
              name: 'Test group', position: 1
            },
            relationships: {
              campaign: { data: { type: 'campaigns', id: 1 } }
            }
          }]
        }

        let(:body) do
          {
            data: {
              type: 'campaign_factor_groups',
              id: campaign_factor_group_id,
              attributes: {
                name: 'Updated group',
                position: 2
              },
              relationships: {
                campaign: { data: { type: 'campaigns', id: campaign_id.to_s } }
              }
            }
          }
        end

        run_test! do |response|
          cfg = JSON.parse(response.body)['data']
          expect(cfg).to have_key('id')
          expect(cfg).to have_attribute(:name).with_value('Updated group')
          expect(cfg).to have_attribute(:position).with_value(2)
          expect(cfg).to have_relationship(:campaign).
            with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
        end
      end
    end

    patch 'Update CampaignFactorGroup Position' do
      operationId 'UpdateCampaignFactorGroupsPosition'
      description 'Update campaign Factor Group position'
      tags 'Campaign Factor Scoring'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :campaign_factor_group_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/CampaignFactorGroupCreateRequest' },
                required: true

      response '200', 'Update campaign factor group position' do
        schema '$ref' => '#/components/schemas/CampaignFactorGroupResponse'

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'campaign_factor_groups',
            attributes: {
              name: 'Test group', position: 2
            },
            relationships: {
              campaign: { data: { type: 'campaigns', id: 1 } }
            }
          }]
        }

        let(:body) do
          {
            data: {
              type: 'campaign_factor_groups',
              id: campaign_factor_group_id,
              attributes: {
                name: 'Updated group', position: 2
              },
              relationships: {
                campaign: { data: { type: 'campaigns', id: campaign_id.to_s } }
              }
            }
          }
        end

        run_test! do |response|
          cfg = JSON.parse(response.body)['data']
          expect(cfg).to have_key('id')
          expect(cfg).to have_attribute(:name).with_value('Updated group')
          expect(cfg).to have_attribute(:position).with_value(2)
          expect(cfg).to have_relationship(:campaign).
            with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
        end
      end
    end

    delete 'Delete CampaignFactorGroup' do
      operationId 'DeleteCampaignFactorGroups'
      description 'Delete campaign Factor Group list'
      tags 'Campaign Factor Scoring'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :campaign_factor_group_id, in: :path, type: :string

      let!(:campaign_factor_group2) { create(:campaign_factor_group, name: 'Test group 2', campaign_id: campaign_id) }

      response '204', 'Delete campaign factor group' do
        run_test! do |response|
          expect(response.body).to eq('')
          expect(CampaignFactorGroup.find_by(id: campaign_factor_group_id)).to eq nil
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/campaign_factor_groups/initialize_scoring' do
    post 'Initialize default CampaignFactorGroup and populate campaign scorings' do
      operationId 'InitializeCampaignFactorGroup'
      description 'Initialize default campaign Factor Group'
      tags 'Campaign Factor Scoring'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string

      response '200', 'Initialize default campaign factor group' do
        schema '$ref' => '#/components/schemas/CampaignFactorGroupResponse'

        examples 'application/json' => {
          data: [{
            type: 'campaign_factor_groups',
            attributes: {
              name: 'Assessment Center', position: 1
            }
          }]
        }

        let!(:campaign_factor_group) { nil }
        let!(:assessment) { FactoryBot.create(:assessment, dimension: Dimension.first) }
        let!(:factor) do
          FactoryBot.create(:factor, dimension: Dimension.first, name: 'Factor - Test!_factor Name')
        end
        let!(:factors_scoring) do
          FactoryBot.create(:factors_scoring, factor: Factor.first, assessment: Assessment.first)
        end
        let!(:campaign_assessor_assessment) do
          FactoryBot.create(:campaign_assessor_assessment, campaign: Campaign.first, assessment: Assessment.first)
        end

        run_test! do |response|
          cfg = JSON.parse(response.body)['data']
          cf = CampaignFactor.last
          expect(cfg).to have_key('id')
          expect(cfg).to have_attribute(:name).with_value('Assessment Center')
          expect(cfg).to have_attribute(:position).with_value(1)
          expect(cfg).to have_relationship(:campaign).
            with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
          expect(cf.code).to eq('factor_test__factor_name')
          expect(cf.factor_type).to eq('assessor_scoring')
          expect(cf.position).to eq(1)
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/campaign_factor_groups/update_positions' do
    post 'Update CampaignFactorGroup positions' do
      operationId 'UpdateCampaignFactorGroups'
      description 'Update campaign Factor Group positions'
      tags 'Campaign Factor Scoring'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body, required: true

      response '200', 'Update campaign factor group positions' do
        examples 'application/json' => {
          data: [{
            type: 'campaign_factor_groups',
            id: 1,
            attributes: { position: 1 }
          }]
        }

        let!(:another_group) { create(:campaign_factor_group, name: 'Test group 2', campaign_id: campaign_id) }
        let(:new_position) { 5 }
        let(:body) do
          {
            data: [
              {
                type: 'campaign_factor_groups',
                id: campaign_factor_group_id,
                attributes: { position: new_position }
              },
              {
                type: 'campaign_factor_groups',
                id: another_group.id,
                attributes: { position: new_position + 1 }
              }
            ]
          }
        end

        run_test! do |response|
          cfg = JSON.parse(response.body)['data'].first
          expect(cfg).to have_key('id')
          expect(cfg).to have_attribute(:name).with_value('Test group')
          expect(cfg).to have_attribute(:position).with_value(5)
          expect(CampaignFactorGroup.find(another_group.id).position).to eq(6)
          expect(cfg).to have_relationship(:campaign).
            with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
        end
      end
    end
  end
end
