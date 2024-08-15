# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::CampaignsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:campaign) { create(:campaign) }
  let!(:idp_template) { create(:idp_template) }
  let!(:superadmin) { create(:superadmin) }
  let!(:include_resource_meta) { 'permissions' }

  before(:each) do
    sign_in(superadmin)
  end

  after(:each) do
    sign_out(superadmin)
  end

  path '/campaigns/{campaign_id}' do
    get 'Show Campaign' do
      operationId 'ShowCampaign'
      tags 'ShowCampaign'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :include_resource_meta, in: :query, required: true

      response '200', 'Campaign Found' do
        let(:campaign_id) { campaign.id }

        run_test! do |response|
          campaign_response = JSON.parse(response.body)['data']
          expect(campaign_response).to have_key('id')
          expect(campaign_response).to have_attribute(:name).with_value(campaign.name)
          expect(campaign_response['meta']).to have_key('permissions')
        end
      end
    end
  end

  path '/campaigns/{campaign_id}' do
    patch 'Update Campaign' do
      operationId 'UpdateCampaign'
      tags 'UpdateCampaign'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/CampaignUpdateRequest' },
                required: true

      response '200', 'Campaign Updated' do
        let(:campaign_id) { campaign.id }

        let(:body) do
          {
            data: {
              type: 'campaigns',
              id: campaign_id.to_s,
              attributes: {},
              relationships: {
                default_idp_template: {
                  data: {
                    type: 'idp_templates',
                    id: idp_template.id.to_s
                  }
                }
              }
            },
            id: campaign_id.to_s
          }
        end
        run_test! do |response|
          campaign_response = JSON.parse(response.body)['data']
          expect(campaign_response).to have_key('id')
          expect(campaign_response).to have_attribute(:name).with_value(campaign.name)
          expect(campaign_response).to have_attribute(:project_id).with_value(campaign.project_id)
          expect(campaign_response).to have_attribute(:default_idp_template_id).with_value(idp_template.id)
          expect(campaign_response).to have_relationship(:default_idp_template).
            with_data({ 'id' => idp_template.id.to_s, 'type' => 'idp_templates' })
        end
      end
    end
  end
end
