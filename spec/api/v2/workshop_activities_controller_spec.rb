# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::WorkshopActivitiesController, swagger_doc: 'v2/swagger.json', type: :request do
  let(:superadmin) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let(:workshop) { create(:workshop, campaign_id: campaign_id) }
  let(:workshop_id) { workshop.id }
  let!(:subject) { create(:workshop_subject, workshop: workshop) }
  let!(:assessor) { create(:assessor, campaign: campaign) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before do
    completed = create(:user_assessment, campaign: campaign, subject: subject.user,
                       status: 2, evaluator: assessor.user)
    another_completed = create(:user_assessment, campaign: campaign,
                               subject: subject.user, status: 2, evaluator: assessor.user)
    not_completed = create(:user_assessment, campaign: campaign, subject: subject.user, evaluator: assessor.user)

    create(:campaign_assessment, assessment: completed.assessment, campaign: campaign,
      prework: true, workshop_activity: true)
    create(:campaign_assessment, assessment: another_completed.assessment, campaign: campaign,
      prework: true, workshop_activity: true)
    create(:campaign_assessment, assessment: not_completed.assessment, campaign: campaign,
      prework: true, workshop_activity: true)

    sign_in(superadmin)
  end

  path '/campaigns/{campaign_id}/workshops/{workshop_id}/workshop_activities' do
    get 'Workshop Activity' do
      operationId 'ActivityList'
      description 'Fetch campaign Workshop Activity list'
      tags 'Campaign Scheduling'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :workshop_id, in: :path, type: :string

      response '200', 'Workshop Activity list' do
        schema '$ref' => '#/components/schemas/UserAssessmentsListResponse'

        examples 'application/json' => {
          data: [
            {
              id: '1',
              type: 'user_assessments',
              attributes: {
                status: 'not_started',
                schedule_time: '2023-08-09T07:00:00.663+04:00'
              },
              relationships: {
                subject: {
                  data: {
                    type: 'users', id: '3'
                  }
                },
                assessor: {
                  data: {
                    type: 'users', id: '4'
                  }
                },
                assessment: {
                  data: {
                    type: 'assessments', id: '1'
                  }
                }
              }
            }
          ]
        }

        run_test! do |response|
          activity_response = JSON.parse(response.body)['data'].first
          expect(activity_response).to have_relationship(:subject).
            with_data({ 'id' => subject.user_id.to_s, 'type' => 'users' })
        end
      end
    end
  end
end
