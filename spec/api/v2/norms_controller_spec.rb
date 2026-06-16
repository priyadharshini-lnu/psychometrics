# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::NormsController, type: :request do
  let(:superadmin) { create(:superadmin) }
  let!(:include_resource_meta) { 'permissions' }
  let!(:norm) { create(:norm) }

  before(:each) { sign_in(superadmin) }

  describe 'GET /api/v2/norms' do
    it 'returns norms list' do
      get '/api/v2/administration/norms',
          params: { include_resource_meta: include_resource_meta },
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
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

  describe 'POST /api/v2/norms' do
    it 'creates a new norm' do
      create(:assessment)
      dimension = create(:dimension)
      create(:tenancy)
      body = {
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

      post '/api/v2/administration/norms',
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      norm_response = JSON.parse(response.body)['data']
      expect(norm_response).to have_key('id')
      expect(norm_response).to have_attribute(:name).with_value('Norm Name')
      expect(norm_response).to have_relationship(:dimension).with_data(
        { 'id' => dimension.id.to_s, 'type' => 'dimensions' }
      )
    end
  end

  describe 'PATCH /api/v2/norms/:id' do
    it 'updates a norm' do
      body = {
        data: {
          id: norm.id.to_s,
          type: 'norms',
          attributes: {
            name: 'Updated Norm Name'
          }
        }
      }

      patch "/api/v2/administration/norms/#{norm.id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      norm_response = JSON.parse(response.body)
      expect(norm_response['data']).to have_key('id')
      expect(norm_response['data']['attributes']).to include('name' => 'Updated Norm Name')
    end
  end

  describe 'DELETE /api/v2/norms/:id' do
    it 'deletes a norm' do
      norm_id = norm.id

      delete "/api/v2/administration/norms/#{norm_id}",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:no_content)
      expect(Norm.find_by(id: norm_id)).to be_nil
    end
  end

  describe 'POST /api/v2/norms/:id/copy' do
    it 'copies a norm' do
      body = {
        data: {
          type: 'norms',
          attributes: {
            name: 'Copied Norm Name'
          }
        }
      }

      post "/api/v2/administration/norms/#{norm.id}/copy",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      norm_response = JSON.parse(response.body)
      expect(norm_response['data']).to have_key('id')
      expect(norm_response['data']['attributes']).to include('name' => 'Copied Norm Name')
    end
  end

  describe 'POST /api/v2/norms/:id/editor' do
    let!(:norm_one) { create(:norm) }
    let!(:factor) { create(:factor, dimension: norm_one.dimension) }
    let!(:factors_norm_one) { create(:factors_norm, norm: norm_one, factor: factor) }
    let!(:factors_norm_two) { create(:factors_norm, norm: norm_one, factor: factor) }

    it 'returns norm editor data' do
      post "/api/v2/administration/norms/#{norm_one.id}/editor",
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      editor_data = JSON.parse(response.body)
      expect(editor_data).to be_an(Array)
      expect(editor_data).to include(
        a_hash_including(
          'id' => factors_norm_one.factor_id,
          'name' => factors_norm_one.factor.name,
          'factors_norms_props' => factors_norm_one.props
        )
      )
    end
  end
end
