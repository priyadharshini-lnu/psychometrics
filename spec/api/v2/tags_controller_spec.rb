# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::TagsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:assessment) { create(:assessment) }
  before do
    sign_in(superadmin)
    set_current_user(superadmin)

    assessment.add_tag('psychometric')
    assessment.save
  end

  describe 'GET /api/v2/tags' do
    it 'returns tag list' do
      get '/api/v2/administration/tags',
          params: { 'query[taggable_resource_type]' => 'Assessment' },
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)

      tag = ActsAsTaggableOn::Tag.named('psychometric').last
      data = JSON.parse(response.body)['data']
      tag_response = data.find { |d| d['id'] == tag.id.to_s }

      expect(tag_response).to have_key('id')
      expect(tag_response).to have_attribute(:name).with_value(tag.name)
    end

    context 'when query[taggable_resource_type] is missing entirely' do
      it 'returns 400 Bad Request, not 500' do
        get '/api/v2/administration/tags',
            headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:bad_request)

        body = JSON.parse(response.body)
        expect(body['errors'].first['detail']).to match(/taggable_resource_type/)
      end
    end

    context 'when query is present but taggable_resource_type is blank' do
      it 'returns 400 Bad Request' do
        get '/api/v2/administration/tags',
            params: { 'query[taggable_resource_type]' => '' },
            headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:bad_request)
      end
    end

    context 'when an unrelated query param is sent instead' do
      it 'returns 400 Bad Request (matches ticket F-07 PoC)' do
        get '/api/v2/administration/tags',
            params: { 'filter[name_cont]' => 'test' },
            headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:bad_request)
      end
    end
  end
end
