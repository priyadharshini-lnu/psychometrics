# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::UserAvailabilityDatesController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:user) { create(:client_admin) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(user) }

  path '/user_availability_dates/' do
    get 'User Availabilities List' do
      operationId 'UserAvailabilityDatesList'
      description 'Fetch User Availabilities'

      tags 'UserAvailabilityDates'
      consumes 'application/json'
      security [basic: []]

      response '200', 'UserAvailabilityDates list' do
        schema '$ref' => '#/components/schemas/UserAvailabilityDatesListResponse'

        examples 'application/json' => [{
          type: 'user_availability_dates',
          data: {
            id: '770',
            attributes: {
              start_date: '2023-10-01',
              end_date: '2023-10-05',
              timezone: 'Asia/Kolkata'
            }
          }
        }]

        let!(:availability_date) { create(:user_availability_date, user: user) }

        run_test! do |response|
          availabilities = JSON.parse(response.body)
          availabilities_response = availabilities['data'].find { |c| c['id'] == availability_date.id.to_s }
          expect(availabilities_response).to have_key('id')
          expect(availabilities_response).to have_attribute(:start_date).with_value(availability_date.start_date.to_s)
          expect(availabilities_response).to have_attribute(:end_date).with_value(availability_date.end_date.to_s)
          expect(availabilities_response).to have_attribute(:timezone).with_value(availability_date.timezone)
        end
      end
    end

    post 'Add User Availabilities' do
      operationId 'AddUserAvailabilityDate'
      description 'Create UserAvailabilityDate'
      tags 'UserAvailabilityDates'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :body, in: :body,
                schema: { '$ref' => '#/components/schemas/UserAvailabilityDateCreateRequest' },
                required: true

      response '201', 'Project Created' do
        schema '$ref' => '#/components/schemas/UserAvailabilityDateResponse'
        examples 'application/json' => [{
          type: 'user_availability_dates',
          data: {
            id: '770',
            attributes: {
              start_date: '2023-10-01',
              end_date: '2023-10-05',
              timezone: 'Asia/Kolkata'
            }
          }
        }]

        let(:body) do
          {
            data: {
              type: 'user_availability_dates',
              attributes: {
                start_date: '2023-10-01',
                end_date: '2023-10-05',
                timezone: 'Asia/Kolkata',
                availability_days: [
                  { day: 1, start_time: '10:00', end_time: '20:00' }
                ]
              }
            }
          }
        end

        run_test! do |response|
          availability = JSON.parse(response.body)['data']
          expect(availability).to have_key('id')
          expect(availability).to have_attribute(:start_date).with_value('2023-10-01')
          expect(availability).to have_attribute(:end_date).with_value('2023-10-05')
          expect(availability).to have_attribute(:timezone).with_value('Asia/Kolkata')
          expect(user.user_availability_days.first.slice(:day, :start_time, :end_time)).to eq(
            { 'day' => 1, 'start_time' => '10:00', 'end_time' => '20:00' }
          )
        end
      end
    end
  end

  path '/user_availability_dates/{user_availability_date_id}/' do
    patch 'Update User Availabilities' do
      operationId 'UpdateUserAvailabilityDate'
      description 'Update a UserAvailabilityDate'
      tags 'UserAvailabilityDates'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :user_availability_date_id, in: :path, type: :string
      parameter name: :body,
                in: :body,
                schema: { '$ref' => '#/components/schemas/UserAvailabilityDateUpdateRequest' },
                required: true

      response '200', 'Client Updated' do
        schema '$ref' => '#/components/schemas/UserAvailabilityDateResponse'
        examples 'application/json' => {
          data: {
            type: 'projects',
            id: '20',
            attributes: {
              disabled: true
            }
          }
        }

        let(:user_availability_date) { create(:user_availability_date, user: user, timezone: 'Asai/Kolkata') }
        let(:user_availability_date_id) { user_availability_date.id.to_s }

        let(:body) do
          {
            data: {
              type: 'user_availability_dates',
              id: user_availability_date_id,
              attributes: {
                start_date: '2032-10-01',
                end_date: '2032-10-05',
                timezone: 'Asia/Muscat',
                availability_days: [
                  { day: 1, start_time: '10:00', end_time: '20:00' }
                ]
              }
            }
          }
        end

        run_test! do |response|
          availability = JSON.parse(response.body)['data']
          expect(availability).to have_key('id')
          expect(availability).to have_attribute(:start_date).with_value('2032-10-01')
          expect(availability).to have_attribute(:end_date).with_value('2032-10-05')
          expect(availability).to have_attribute(:timezone).with_value('Asia/Muscat')
          expect(user_availability_date.user_availability_days.first.slice(:day, :start_time, :end_time)).to eq(
            { 'day' => 1, 'start_time' => '10:00', 'end_time' => '20:00' }
          )
        end
      end
    end
  end
end
