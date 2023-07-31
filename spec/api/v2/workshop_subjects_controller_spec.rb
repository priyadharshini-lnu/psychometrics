# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::WorkshopSubjectsController, swagger_doc: 'v2/swagger.json', type: :request do
  let(:superadmin) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let(:workshop) { create(:workshop, campaign_id: campaign_id) }
  let(:workshop_id) { workshop.id }
  let!(:subject) { create(:workshop_subject, workshop: workshop) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before do
    completed = create(:user_assessment, campaign: campaign, subject: subject.user, status: 2)
    another_completed = create(:user_assessment, campaign: campaign, subject: subject.user, status: 2)
    not_completed = create(:user_assessment, campaign: campaign, subject: subject.user)
    create(:campaign_assessment, assessment: completed.assessment, campaign: campaign,
      prework: true, workshop_activity: true)
    create(:campaign_assessment, assessment: another_completed.assessment, campaign: campaign,
      prework: true, workshop_activity: true)
    create(:campaign_assessment, assessment: not_completed.assessment, campaign: campaign,
      prework: true, workshop_activity: true)

    sign_in(superadmin)
  end

  path '/campaigns/{campaign_id}/workshops/{workshop_id}/workshop_subjects' do
    get 'Workshop Subjects List' do
      operationId 'WorkshopSubjectsList'
      description 'Fetch campaign Workshop Subjects list'
      tags 'Campaign Scheduling'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :workshop_id, in: :path, type: :string

      response '200', 'Workshop Subjects list' do
        schema '$ref' => '#/components/schemas/WorkshopSubjectsListResponse'

        examples 'application/json' => {
          data: [
            {
              id: '1',
              type: 'subjects',
              links: {
                self: 'http://www.example.com/api/v2/administration/workshop_subjects/1'
              },
              attributes: { status: 'not_started', attended: false, preworks: '0/0', workshop_activities: '0/0' },
              relationships: {
                user: {
                  data: {
                    type: 'users', id: '3'
                  }
                }
              }
            }
          ]
        }

        run_test! do |response|
          subject_response = JSON.parse(response.body)['data'].first
          expect(subject_response).to have_attribute(:status).with_value('not_started')
          expect(subject_response).to have_attribute(:attended).with_value(false)
          expect(subject_response).to have_attribute(:preworks).with_value('2/3')
          expect(subject_response).to have_attribute(:workshop_activities).with_value('2/3')
          expect(subject_response).to have_relationship(:user).
            with_data({ 'id' => subject.user_id.to_s, 'type' => 'users' })
        end
      end
    end
  end
end
