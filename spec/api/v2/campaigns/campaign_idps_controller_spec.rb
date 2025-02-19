# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::Campaigns::CampaignIdpsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:assessor) { create(:user, :assessor) }
  let!(:campaign) { create(:campaign) }
  let!(:idp_template) { create(:idp_template) }
  let!(:idp_template2) { create(:idp_template) }
  let(:user) { create(:user) }
  let(:campaign_id) { campaign.id }
  let(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/campaigns/{campaign_id}/campaign_idps' do
    get 'Campaign IDPs' do
      operationId 'CampaignIDP'
      description 'Fetch campaign idp'
      tags 'CampaignIDP'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string

      response '200', 'Campaign idp list' do
        let!(:campaign_idp) { create(:campaign_idp, campaign: campaign, idp_template: idp_template).id }
        schema '$ref' => '#/components/schemas/CampaignIdpListResponse'

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'campaign_idps',
            attributes: {
              id: '1'
            }
          }]
        }

        run_test! do |response|
          d = JSON.parse(response.body)['data'].first
          expect(d).to have_relationship(:idp_template)
          expect(d).to have_relationship(:campaign)
        end
      end
    end

    post 'Create Campaing IDP' do
      operationId 'CampaignIDP'
      description 'Create campaign idp'
      tags 'CampaignIDP'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/CampaignIdpCreateRequest' },
                required: true

      response '201', 'Create campaign idp ' do
        let(:body) do
          {
            data: {
              type: 'campaign_idps',
              attributes: {
                override_exists: false,
                automatically_assign_new: true
              },
              relationships: {
                campaign: {
                  data: {
                    type: 'campaigns',
                    id: campaign.id.to_s
                  }
                },
                idp_template: {
                  data: {
                    type: 'idp_templates',
                    id: idp_template2.id.to_s
                  }
                }
              }
            }
          }
        end

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d).to have_relationship(:idp_template)
          expect(d).to have_relationship(:campaign)
          expect(d.dig('relationships', 'idp_template', 'data', 'id')).to eq(idp_template2.id.to_s)
          expect(AdminJobRecord.count).to eq(0)
        end
      end
    end

    post 'Create Campaing IDP with job' do
      operationId 'CampaignIDP'
      description 'Create campaign idp'
      tags 'CampaignIDP'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/CampaignIdpCreateRequest' },
                required: true

      response '201', 'Create campaign idp ' do
        let(:body) do
          {
            data: {
              type: 'campaign_idps',
              attributes: {
                override_exists: true,
                automatically_assign_new: true
              },
              relationships: {
                campaign: {
                  data: {
                    type: 'campaigns',
                    id: campaign.id.to_s
                  }
                },
                idp_template: {
                  data: {
                    type: 'idp_templates',
                    id: idp_template2.id.to_s
                  }
                }
              }
            }
          }
        end

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d).to have_relationship(:idp_template)
          expect(d).to have_relationship(:campaign)
          expect(d.dig('relationships', 'idp_template', 'data', 'id')).to eq(idp_template2.id.to_s)
          expect(AdminJobRecord.count).to eq(1)
          expect(AdminJobRecord.last.operation).to eq('assign_idp_to_users')
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/campaign_idps/{id}' do
    patch 'Update Campaing IDP' do
      operationId 'CampaignIDP'
      description 'Update campaign idp'
      tags 'CampaignIDP'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/CampaignIdpUpdateRequest' },
                required: true

      response '200', 'Update campaign idp ' do
        let(:id) { create(:campaign_idp, campaign: campaign, idp_template: idp_template).id }

        let(:body) do
          {
            data: {
              id: id.to_s,
              type: 'campaign_idps',
              attributes: {
                override_exists: false,
                automatically_assign_new: true
              },
              relationships: {
                campaign: {
                  data: {
                    type: 'campaigns',
                    id: campaign.id.to_s
                  }
                },
                idp_template: {
                  data: {
                    type: 'idp_templates',
                    id: idp_template2.id.to_s
                  }
                }
              }
            }
          }
        end

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d).to have_relationship(:idp_template)
          expect(d).to have_relationship(:campaign)
          expect(d.dig('relationships', 'idp_template', 'data', 'id')).to eq(idp_template2.id.to_s)
          expect(AdminJobRecord.count).to eq(0)
        end
      end
    end

    patch 'Update Campaing IDP with override exists' do
      operationId 'CampaignIDP'
      description 'Update campaign idp'
      tags 'CampaignIDP'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/CampaignIdpUpdateRequest' },
                required: true

      response '200', 'Update campaign idp ' do
        let(:id) { create(:campaign_idp, campaign: campaign, idp_template: idp_template).id }

        let(:body) do
          {
            data: {
              id: id.to_s,
              type: 'campaign_idps',
              attributes: {
                override_exists: true,
                automatically_assign_new: true
              },
              relationships: {
                campaign: {
                  data: {
                    type: 'campaigns',
                    id: campaign.id.to_s
                  }
                },
                idp_template: {
                  data: {
                    type: 'idp_templates',
                    id: idp_template2.id.to_s
                  }
                }
              }
            }
          }
        end

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d).to have_relationship(:idp_template)
          expect(d).to have_relationship(:campaign)
          expect(d.dig('relationships', 'idp_template', 'data', 'id')).to eq(idp_template2.id.to_s)
          expect(AdminJobRecord.count).to eq(1)
          expect(AdminJobRecord.last.operation).to eq('assign_idp_to_users')
        end
      end
    end
  end
end
