# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::WorkshopsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let!(:workshop) { create(:workshop, :with_managers, :with_assessors, campaign_id: campaign_id) }
  let!(:workshop_id) { workshop.id }
  let!(:workshop_subject) { create(:workshop_subject, workshop: workshop) }
  let!(:user1) { create(:user, email: 'user1@test.test') }
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

  path '/workshops/{workshop_id}/bulk_update_subjects' do
    before do
      create(:campaign_user, campaign: workshop.campaign, user: workshop_subject.user)
      @user_assessment = create(:user_assessment, campaign: workshop.campaign, subject: workshop_subject.user)
    end
    post 'Bulk update workshop subjects' do
      operationId 'BulkUpdateSubjects'
      description 'Bulk update subjects'
      tags 'Workshops'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :workshop_id, in: :path, type: :string
      parameter name: :body, in: :body,
                schema: { '$ref' => '#/components/schemas/WorkshopBulkUpdateSubjectsRequest' },
                required: true

      response '200', 'BulkUpdateSubjects' do
        schema '$ref' => '#/components/schemas/WorkshopResponse'
        examples 'application/json' => {
          data: {
            type: 'workshops',
            attributes: {
              subject_ids: [1],
              assessment: [
                { action: 'no_change', assessment_id: '1', time: nil }
              ]
            }
          }
        }

        let(:body) do
          {
            filter: {
              workshops_campaign_id_eq: workshop.campaign.id
            },
            data: {
              type: 'workshops',
              attributes: {
                subject_ids: [workshop_subject.id],
                assessments: [
                  {
                    action: 'schedule',
                    assessment_id: @user_assessment.assessment_id,
                    time: '2023-08-04T02:00:00.063Z'
                  }
                ],
                override_existing: true
              }
            }
          }
        end

        run_test! do |_|
          expect(@user_assessment.reload.schedule_time).to eq('Fri, 04 Aug 2023 06:00:00.063000000 +04 +04:00')
        end
      end
    end
  end
end
