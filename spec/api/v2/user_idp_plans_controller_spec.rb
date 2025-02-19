# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::UserIdpPlansController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:user) { create(:user) }
  let!(:idp_template) { create(:idp_template) }
  let!(:campaign) { create(:campaign) }
  let!(:superadmin) { create(:superadmin) }
  let!(:idp_template1) { create(:idp_template) }
  let!(:license) { create(:license, client: campaign.client, type: :idp) }
  before(:each) do
    sign_in(superadmin)
  end

  after(:each) do
    sign_out(superadmin)
  end

  path '/user_idp_plans' do
    post 'Create IDP Plan' do
      operationId 'CreateUserIdpPlan'
      tags 'CreateUserIdpPlan'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/UserIdpPlanCreateRequest' },
                required: true

      response '201', 'IDP Plan Created' do
        let(:body) do
          {
            data: {
              type: 'user_idp_plans',
              attributes: {
                user_id: user.id.to_s,
                idp_template_id: idp_template.id.to_s,
                campaign_id: campaign.id.to_s,
                creator_id: superadmin.id.to_s
              }
            }
          }
        end

        run_test! do |response|
          idp_plan_response = JSON.parse(response.body)['data']
          expect(idp_plan_response).to have_attribute(:user_id).with_value(user.id)
          expect(idp_plan_response).to have_attribute(:idp_template_id).with_value(idp_template.id)
          expect(idp_plan_response).to have_attribute(:campaign_id).with_value(campaign.id)
          expect(idp_plan_response).to have_attribute(:active).with_value(true)
          expect(idp_plan_response).to have_attribute(:creator_id).with_value(superadmin.id)
        end
      end
    end
  end

  path '/user_idp_plans' do
    post 'Create IDP Plan' do
      operationId 'CreateUserIdpPlan'
      tags 'CreateUserIdpPlan'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/UserIdpPlanCreateRequest' },
                required: true

      response '422', 'IDP Plan creation failed due to existing plan' do
        let(:body) do
          {
            data: {
              type: 'user_idp_plans',
              attributes: {
                user_id: user.id.to_s,
                idp_template_id: idp_template.id.to_s,
                campaign_id: campaign.id.to_s,
                creator_id: superadmin.id.to_s
              }
            }
          }
        end

        let!(:existing_plan) do
          create(:user_idp_plan, user: user, idp_template: idp_template, campaign: campaign, creator: superadmin)
        end

        run_test! do |response|
          error_response = JSON.parse(response.body)['errors']
          expect(error_response.first['title']).to eq('This Idp Template is already assiged to this user and is active')
          expect(error_response.first['status']).to eq('422')
        end
      end
    end
  end

  path '/user_idp_plans' do
    post 'Activate existing Inactive User IDP Plan' do
      operationId 'ActiveExistingInactiveUserIdpPlan'
      tags 'ActiveExistingInactiveUserIdpPlan'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/UserIdpPlanCreateRequest' },
                required: true

      response '201', 'Activate existing Inactive User IDP Plan' do
        let(:body) do
          {
            data: {
              type: 'user_idp_plans',
              attributes: {
                user_id: user.id.to_s,
                idp_template_id: idp_template.id.to_s,
                campaign_id: campaign.id.to_s,
                creator_id: superadmin.id.to_s
              }
            }
          }
        end

        let!(:existing_plan) do
          create(:user_idp_plan, user: user, idp_template: idp_template, campaign: campaign, creator: superadmin,
active: false)
        end

        let!(:existing_plan1) do
          create(:user_idp_plan, user: user, idp_template: idp_template1, campaign: campaign, creator: superadmin)
        end

        run_test! do |response|
          idp_plan_response = JSON.parse(response.body)['data']
          expect(idp_plan_response).to have_attribute(:user_id).with_value(user.id)
          expect(idp_plan_response).to have_attribute(:idp_template_id).with_value(idp_template.id)
          expect(idp_plan_response).to have_attribute(:campaign_id).with_value(campaign.id)
          expect(idp_plan_response).to have_attribute(:active).with_value(true)
          expect(idp_plan_response).to have_attribute(:creator_id).with_value(superadmin.id)
        end
      end
    end
  end
end
