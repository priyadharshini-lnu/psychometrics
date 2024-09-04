# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::Clients::IdpTemplatesController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:idp_template) { create(:idp_template) }
  let!(:client) { create(:tenancy) }
  let(:client_id) { client.id }
  let!(:superadmin) { create(:superadmin) }
  let!(:user) { create(:user) }
  let!(:user_id) { user.id }
  let!(:campaign) { create(:campaign) }

  before(:each) do
    sign_in(superadmin)
  end

  after(:each) do
    sign_out(superadmin)
  end

  path '/clients/:client_id/idp_templates' do
    get 'Idp Template list' do
      operationId 'IdpTemplateList'
      tags 'IdpTemplate'
      consumes 'application/json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string

      response '200', 'Idp Template list' do
        run_test! do |response|
          idp_templates = JSON.parse(response.body)['data']
          expect(idp_templates[0]).to have_key('id')
          expect(idp_templates[0]).to have_attribute(:name).with_value(idp_template.name)
          expect(idp_templates[0]).to have_attribute(:description).with_value(idp_template.description)
        end
      end
    end
  end
end
