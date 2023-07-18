# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::WorkshopsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let!(:workshop) { create(:workshop, :with_managers, :with_assessors, campaign_id: campaign_id) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/campaigns/{campaign_id}/workshops/' do
    get 'Workshops List' do
      operationId 'WorkshopsList'
      description 'Fetch campaign Workshops list'
      tags 'Campaign Scheduling'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string

      response '200', 'Workshops list' do
        schema '$ref' => '#/components/schemas/WorkshopsListResponse'

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'workshops',
            links: {
              self: 'http://www.example.com/api/v2/administration/workshops/1'
            },
            attributes: {
              start_time: '2018-09-15T09:31:42.000+04:00',
              duration: 14_400
            },
            relationships: {
              workshop_managers: {
                data: {
                  type: 'workshop_managers',
                  id: '2'
                }
              },
              workshop_assessors: {
                data: {
                  type: 'workshop_assessors',
                  id: '3'
                }
              }
            }
          }]
        }

        run_test! do |response|
          workshop_response = JSON.parse(response.body)['data'].first
          expect(workshop_response).to have_attribute(:start_time).with_value('2018-09-15T09:31:42.000+04:00')
          expect(workshop_response).to have_attribute(:duration).with_value(workshop.duration)
          expect(workshop_response).to have_relationship(:workshop_managers)
          expect(workshop_response).to have_relationship(:workshop_assessors)
        end
      end
    end
  end
end
