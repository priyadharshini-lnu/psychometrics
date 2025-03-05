# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::NormsController, swagger_doc: 'v2/swagger.json', type: :request do
  let(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }
  let!(:include_resource_meta) { 'permissions' }
  let!(:norm) { create(:norm) }

  before(:each) { sign_in(superadmin) }

  path '/norms' do
    get 'Norms List' do
      operationId 'NormsList'

      description 'Fetch Norms list'
      tags 'Norms'
      consumes 'application/json'
      security [basic: []]
      parameter name: :include_resource_meta, in: :query, required: true

      response '200', 'Norm list' do
        schema '$ref' => '#/components/schemas/NormsListResponse'

        examples 'application/json' => [{
          type: 'norms',
          data: {
            id: '770',
            attributes: {
              name: 'Norm Name',
              disabled: false,
              created_at: '2021-01-01',
              updated_at: '2021-01-01',
              norm_type: 'Norm Type'
            }
          },
          meta: {
            permissions: {
              edit: true,
              copy: true,
              delete: true,
              export_raw_results: true,
              export_raw_factor_scores: true,
              export_normed_results: true
            }
          }
        }]

        run_test! do |response|
          norms = JSON.parse(response.body)
          norm_response = norms['data'].find { |n| n['id'] == norm.id.to_s }
          expect(norm_response).to have_key('id')
          expect(norm_response).to have_attribute(:name).with_value(norm.name)
          expect(norm_response).to have_attribute(:disabled).with_value(norm.disabled)
          expect(norm_response).to have_attribute(:created_at).with_value(norm.decorate.created_at)
          expect(norm_response).to have_attribute(:updated_at).with_value(norm.decorate.updated_at)
          expect(norm_response).to have_attribute(:norm_type).with_value(norm.norm_type)
        end
      end
    end
  end

  path '/norms/' do
    post 'Create a norm' do
      operationId 'CreateNorm'
      description 'Create new Norm'
      tags 'Norms'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/NormCreateRequest' }, required: true

      response '201', 'Norm created' do
        schema '$ref' => '#/components/schemas/NormResponse'

        let(:assessment) { create(:assessment) }
        let(:dimension) { create(:dimension) }
        let(:client) { create(:tenancy) }
        let(:body) do
          {
            data: {
              type: 'norms',
              attributes: {
                name: 'Norm Name',
                norm_type: 'five_scale'
              },
              relationships: {
                dimension: { data: { type: 'dimensions', id: dimension.id } }
              }
            }
          }
        end

        run_test! do |response|
          norm_response = JSON.parse(response.body)['data']
          expect(norm_response).to have_key('id')
          expect(norm_response).to have_attribute(:name).with_value('Norm Name')
          expect(norm_response).to have_relationship(:dimension).with_data(
            { 'id' => dimension.id.to_s, 'type' => 'dimensions' }
          )
        end
      end
    end
  end

  path '/norms/{id}' do
    patch 'Update a norm' do
      operationId 'UpdateNorm'
      description 'Update Norm'
      tags 'Norms'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :id, in: :path, type: :string, required: true
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/NormUpdateRequest' }, required: true

      response '200', 'Norm updated' do
        schema '$ref' => '#/components/schemas/NormResponse'

        let(:id) { norm.id }
        let(:body) do
          {
            data: {
              id: id.to_s,
              type: 'norms',
              attributes: {
                name: 'Updated Norm Name'
              }
            }
          }
        end

        run_test! do |response|
          norm_response = JSON.parse(response.body)
          expect(norm_response['data']).to have_key('id')
          expect(norm_response['data']['attributes']).to include('name' => 'Updated Norm Name')
        end
      end
    end
  end

  path '/norms/{id}' do
    delete 'Delete a norm' do
      operationId 'DeleteNorm'
      description 'Delete Norm'
      tags 'Norms'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :id, in: :path, type: :string, required: true

      let(:id) { norm.id }

      response '204', 'Norm deleted' do
        run_test! do |response|
          expect(response).to have_http_status(:no_content)
          expect(Norm.find_by(id: id)).to be_nil
        end
      end
    end
  end

  path '/norms/{id}/copy' do
    post 'Copy a norm' do
      operationId 'CopyNorm'
      description 'Copy Norm'
      tags 'Norms'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :id, in: :path, type: :string, required: true
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/NormCopyRequest' }, required: true

      response '200', 'Norm copied' do
        schema '$ref' => '#/components/schemas/NormResponse'

        let(:id) { norm.id }
        let(:body) do
          {
            data: {
              type: 'norms',
              attributes: {
                name: 'Copied Norm Name'
              }
            }
          }
        end

        run_test! do |response|
          norm_response = JSON.parse(response.body)
          expect(norm_response['data']).to have_key('id')
          expect(norm_response['data']['attributes']).to include('name' => 'Copied Norm Name')
        end
      end
    end
  end
end
