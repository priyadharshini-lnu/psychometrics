# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::UserAvailabilityDatesController, type: :request do
  let!(:user) { create(:client_admin) }

  before { sign_in(user) }

  describe 'GET /api/v2/administration/user_availability_dates/' do
    it 'returns user availability dates list' do
      get '/api/v2/administration/user_availability_dates'

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      expect(data).to be_an(Array)
    end
  end

  describe 'POST /api/v2/administration/user_availability_dates/' do
    it 'creates a user availability date' do
      body = {
        data: {
          type: 'user_availability_dates',
          attributes: {
            start_date: Date.current.to_s,
            end_date: (Date.current + 30.days).to_s,
            timezone: 'UTC',
            availability_days: [
              { day: 1, start_time: '09:00', end_time: '17:00' }
            ]
          }
        }
      }

      post '/api/v2/administration/user_availability_dates',
           params: body.to_json,
           headers: {
             'Content-Type' => 'application/vnd.api+json'
           }

      expect(response).to have_http_status(:created)
      data = JSON.parse(response.body)['data']
      expect(data).to have_key('id')
      expect(data['attributes']['start_date']).to be_present
      expect(data['attributes']['timezone']).to eq('UTC')
      expect(data['relationships']).to have_key('user_availability_days')
    end
  end

  describe 'PATCH /api/v2/administration/user_availability_dates/:user_availability_date_id/' do
    let!(:user_availability_date) { create(:user_availability_date, user: user) }

    it 'updates a user availability date' do
      body = {
        data: {
          type: 'user_availability_dates',
          id: user_availability_date.id.to_s,
          attributes: {
            start_date: (Date.current + 1.day).to_s,
            end_date: (Date.current + 31.days).to_s,
            timezone: 'UTC',
            availability_days: [
              { day: 2, start_time: '10:00', end_time: '18:00' }
            ]
          }
        }
      }

      patch "/api/v2/administration/user_availability_dates/#{user_availability_date.id}",
            params: body.to_json,
            headers: {
              'Content-Type' => 'application/vnd.api+json'
            }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      expect(data['attributes']['end_date']).to be_present
      expect(data['attributes']['timezone']).to eq('UTC')
    end
  end
end
