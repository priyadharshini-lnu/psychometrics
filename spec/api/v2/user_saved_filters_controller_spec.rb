# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::UserSavedFiltersController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:admin) { create(:client_admin) }
  let!(:user) { create(:user) }
  let(:resource_type) { 'report_approvals_my_tasks' }
  let(:filter_payload) { { 'filterable_fields' => 'rails', 'with_resource_state' => 'active' } }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(admin) }

  path '/user_saved_filters/' do
    get 'List User Saved Filters' do
      operationId 'getUserSavedFilters'
      description 'Lists all User saved filters for the current user and specified resource type'
      tags 'UserSavedFilters'
      consumes 'application/vnd.api+json'
      security [basic: []]

      parameter name: :'filter[resource_type_eq]', in: :query, required: true, type: :string,
                description: 'Resource type to filter by (e.g., report, assessment)'

      response '200', 'User Saved filters found' do
        let!(:'filter[resource_type_eq]') { resource_type }

        before do
          create_list(:user_saved_filter, 3, user: admin, resource_type: resource_type)
          create(:user_saved_filter, user: user, resource_type: 'report_approvals_all') # different resource type
          create(:user_saved_filter, user: admin, resource_type: 'report_approvals_all') # different user
        end

        run_test! do |response|
          expect(response).to have_http_status(:ok)

          json_response = JSON.parse(response.body)

          expect(json_response['data'].size).to eq(3)
          expect(json_response['data'].map { |f| f['attributes']['resource_type'] }.uniq).to eq([resource_type])
        end
      end
    end

    post 'Create User Saved Filter' do
      operationId 'createUserSavedFilter'
      description 'Creates a new saved filter for the current user'
      tags 'UserSavedFilters'
      consumes 'application/vnd.api+json'
      security [basic: []]

      parameter name: :body, in: :body, required: true

      response '201', 'Filter created successfully' do
        let(:body) do
          {
            data: {
              type: 'user_saved_filters',
              attributes: {
                name: 'My Test Filter',
                resource_type: resource_type,
                filter_params: filter_payload
              }
            }
          }
        end

        run_test! do |response|
          expect(response).to have_http_status(:created)

          json_response = JSON.parse(response.body)
          expect(json_response['data']['attributes']['name']).to eq('My Test Filter')
          expect(json_response['data']['attributes']['favorite']).to be_truthy # 1st filter is favorite by default
        end
      end

      response '422', 'Duplicate name not allowed' do
        let!(:existing_filter) do
          create(:user_saved_filter, user: admin, resource_type: resource_type, name: 'Filter')
        end

        let(:body) do
          {
            data: {
              type: 'user_saved_filters',
              attributes: {
                name: 'Filter',
                favorite: false,
                resource_type: resource_type,
                filter_params: filter_payload
              }
            }
          }
        end

        run_test! do |response|
          expect(response).to have_http_status(:unprocessable_entity)

          json_response = JSON.parse(response.body)
          expect(json_response['errors']).to include(
            'title' => 'A filter with the same name already exists.',
            'source' => { 'pointer' => '/data/attributes/name' },
            'status' => '422'
          )
        end
      end

      response '422', 'Invalid parameters' do
        let(:body) do
          {
            data: {
              type: 'user_saved_filters',
              attributes: {
                name: '',
                favorite: true,
                resource_type: resource_type,
                filter_params: filter_payload
              }
            }
          }
        end

        run_test! do |response|
          expect(response).to have_http_status(:unprocessable_entity)

          json_response = JSON.parse(response.body)
          expect(json_response['errors']).to include(
            'title' => "can't be blank",
            'source' => { 'pointer' => '/data/attributes/name' },
            'status' => '422'
          )
        end
      end

      response '422', 'Filter limit reached' do
        before do
          create_list(:user_saved_filter, 10, user: admin, resource_type: resource_type)
        end

        let(:body) do
          {
            data: {
              type: 'user_saved_filters',
              attributes: {
                name: 'Test',
                favorite: true,
                resource_type: resource_type,
                filter_params: filter_payload
              }
            }
          }
        end

        run_test! do |response|
          expect(response).to have_http_status(:unprocessable_entity)

          json_response = JSON.parse(response.body)
          expect(json_response['errors']).to include({
            'title' => 'You can only have 10 saved filters, kindly delete saved filters to add more.',
            'source' => { 'pointer' => '/data' },
            'status' => '422'
          })
        end
      end
    end
  end

  path '/user_saved_filters/{id}' do
    patch 'Update User Saved Filter' do
      operationId 'updateUserSavedFilter'
      description 'Updates an existing user saved filter'
      tags 'UserSavedFilters'
      consumes 'application/vnd.api+json'
      security [basic: []]

      parameter name: :body, in: :body, required: true
      parameter name: :id, in: :path, type: :string, required: true

      let!(:user_saved_filter) do
        create(:user_saved_filter, user: admin, resource_type: resource_type, name: 'Original Name')
      end
      let(:id) { user_saved_filter.id }

      response '200', 'Filter updated successfully' do
        context 'when updating name' do
          let(:body) do
            {
              data: {
                type: 'user_saved_filters',
                id: id.to_s,
                attributes: {
                  name: 'Updated Name'
                }
              }
            }
          end

          run_test! do |response|
            expect(response).to have_http_status(:ok)

            json_response = JSON.parse(response.body)
            expect(json_response['data']['attributes']['name']).to eq('Updated Name')
          end
        end

        context 'when updating filter payload' do
          let(:body) do
            {
              data: {
                type: 'user_saved_filters',
                id: id.to_s,
                attributes: {
                  filter_params: {
                    filterable_fields: 'react',
                    with_resource_state: 'inactive'
                  }
                }
              }
            }
          end

          run_test! do |response|
            expect(response).to have_http_status(:ok)

            json_response = JSON.parse(response.body)
            expect(json_response['data']['attributes']['filter_params']).to include('filterable_fields' => 'react')
          end
        end

        context 'when setting filter as favorite' do
          let!(:existing_favorite) do
            create(:user_saved_filter, user: admin, resource_type: resource_type, favorite: true)
          end

          let(:body) do
            {
              data: {
                type: 'user_saved_filters',
                id: id.to_s,
                attributes: {
                  favorite: true
                }
              }
            }
          end

          run_test! do |response|
            expect(response).to have_http_status(:ok)

            json_response = JSON.parse(response.body)
            expect(admin.user_saved_filters.by_resource_type(resource_type).favorites.count).to eq(1)
            expect(json_response['data']['attributes']['favorite']).to be_truthy
            expect(existing_favorite.reload.favorite).to be_falsey
          end
        end
      end
    end
  end

  path '/user_saved_filters/{id}' do
    delete 'Delete User Saved Filter' do
      operationId 'deleteUserSavedFilter'
      description 'Deletes a user saved filter'
      tags 'UserSavedFilters'
      consumes 'application/vnd.api+json'
      security [basic: []]

      parameter name: :id, in: :path, type: :string, required: true

      let!(:user_saved_filter) { create(:user_saved_filter, user: admin, resource_type: resource_type) }
      let(:id) { user_saved_filter.id }

      response '204', 'Filter deleted successfully' do
        run_test! do |response|
          expect(response).to have_http_status(:no_content)
          expect(UserSavedFilter.find_by(id: id)).to be_nil
        end
      end
    end
  end
end
