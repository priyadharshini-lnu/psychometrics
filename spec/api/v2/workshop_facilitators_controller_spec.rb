# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::WorkshopFacilitatorsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:assessment) { create(:assessment, category: 'psychometric') }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/workshop_facilitators/search_managers/' do
    get 'Search Center Managers' do
      operationId 'AssessmentsList'

      description 'Fetch Available Center Managers'
      tags 'Facilitators'
      consumes 'application/json'
      security [basic: []]
      parameter name: :start_date_time, in: :query, required: true
      parameter name: :end_date_time, in: :query, required: true
      parameter name: :campaign_id, in: :query, required: true
      parameter name: :search_term, in: :query, required: true

      response '200', 'Available center manager list' do
        let(:campaign) { create(:campaign) }
        let(:campaign_id) { campaign.id }
        let(:admins) { create_list(:user, 2, role: User::ADMIN_ROLE) }
        let!(:search_term) { admins[0].first_name }
        let(:start_date_time) { '2023-07-11 07:00:00 +0400' }
        let(:end_date_time) { '2023-07-11 08:00:00 +0400' }

        before do
          create(:membership, user: admins[0], campaign: campaign, role: Membership::CAMPAIGN_ADMIN_ROLE)
          admins.each do |admin|
            admin_availability_date = create(
              :user_availability_date,
              timezone: 'Asia/Muscat',
              user: admin,
              start_date: Date.parse('2023-07-10'),
              end_date: Date.parse('2023-07-20')
            )
            create(
              :user_availability_day,
              user_availability_date: admin_availability_date,
              day: 2,
              start_time: '06:00:00',
              end_time: '08:00:00'
            )
          end
        end

        schema '$ref' => '#/components/schemas/WorkshopFacilitatorsResponse'

        examples 'application/json' => [{
          type: 'clients',
          data: {
            attributes: {
              full_name: 'John Doe',
              email: 'john@cc.com',
              photo_url: 'https://www.example.com/photo.jpg'
            }
          }
        }]

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          facilitators = data.find { |d| d['id'] == admins[0].id.to_s }
          expect(data.length).to eq(1)
          expect(facilitators).to have_key('id')
          expect(facilitators).to have_attribute('photo_url')
          expect(facilitators).to have_attribute(:full_name).with_value(admins[0].decorate.display_name)
          expect(facilitators).to have_attribute(:email).with_value(admins[0].email)
        end
      end
    end
  end

  path '/workshop_facilitators/search_assessors/' do
    get 'Search Assessors' do
      operationId 'AssessmentsList'

      description 'Fetch Assessors'
      tags 'Assessors'
      consumes 'application/json'
      security [basic: []]
      parameter name: :start_date_time, in: :query, required: true
      parameter name: :end_date_time, in: :query, required: true
      parameter name: :search_term, in: :query, required: true

      response '200', 'Available assessors list' do
        let(:global_assessor) { create(:user, role: User::ADMIN_ROLE, global_assessor: true) }
        let(:not_global_assessor) { create(:user, role: User::ADMIN_ROLE, global_assessor: false) }
        let!(:search_term) { global_assessor.first_name }
        let(:start_date_time) { '2023-07-11 07:00:00 +0400' }
        let(:end_date_time) { '2023-07-11 08:00:00 +0400' }

        before do
          [global_assessor, not_global_assessor].each do |admin|
            admin_availability_date = create(
              :user_availability_date,
              timezone: 'Asia/Muscat',
              user: admin,
              start_date: Date.parse('2023-07-10'),
              end_date: Date.parse('2023-07-20')
            )
            create(
              :user_availability_day,
              user_availability_date: admin_availability_date,
              day: 2,
              start_time: '06:00:00',
              end_time: '08:00:00'
            )
          end
        end

        schema '$ref' => '#/components/schemas/WorkshopFacilitatorsResponse'

        examples 'application/json' => [{
          type: 'clients',
          data: {
            attributes: {
              full_name: 'John Doe',
              email: 'john@cc.com',
              photo_url: 'https://www.example.com/photo.jpg'
            }
          }
        }]

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          assessors = data.find { |d| d['id'] == global_assessor.id.to_s }
          expect(data.length).to eq(1)
          expect(assessors).to have_key('id')
          expect(assessors).to have_attribute('photo_url')
          expect(assessors).to have_attribute(:full_name).with_value(global_assessor.decorate.display_name)
          expect(assessors).to have_attribute(:email).with_value(global_assessor.email)
        end
      end
    end
  end
end
