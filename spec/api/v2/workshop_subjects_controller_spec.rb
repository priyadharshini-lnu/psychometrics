# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::WorkshopSubjectsController, swagger_doc: 'v2/swagger.json', type: :request do
  let(:superadmin) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let!(:group) { create(:campaign_assessment_group, campaign: campaign) }
  let(:workshop) { create(:workshop, campaign_id: campaign_id, campaign_assessment_group: group) }
  let(:workshop_id) { workshop.id }
  let!(:subject) { create(:workshop_subject, workshop: workshop) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before do
    completed = create(:user_assessment, prework: true, campaign: campaign, subject: subject.user, status: 2)
    another_completed = create(:user_assessment, prework: true, campaign: campaign, subject: subject.user, status: 2)
    not_completed = create(:user_assessment, prework: true, campaign: campaign, subject: subject.user)
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
              attributes: {
                attendance_status: 'no_status',
                attended: false,
                preworks: '0/0',
                workshop_activities: '0/0'
              },
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
          expect(subject_response).to have_attribute(:attendance_status).with_value('no_status')
          expect(subject_response).to have_attribute(:attended).with_value(false)
          expect(subject_response).to have_attribute(:preworks).with_value('2/3')
          expect(subject_response).to have_attribute(:workshop_activities).with_value('2/3')
          expect(subject_response).to have_relationship(:user).
            with_data({ 'id' => subject.user_id.to_s, 'type' => 'users' })
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/workshops/{workshop_id}/workshop_subjects/{subject_id}' do
    patch 'Update Workshop Subject' do
      operationId 'UpdateWorkshopsSubjects'
      description 'Update Workshop Subject'
      tags 'Campaign Scheduling'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :workshop_id, in: :path, type: :string
      parameter name: :subject_id, in: :path, type: :string
      parameter name: :body, in: :body,
                schema: { '$ref' => '#/components/schemas/WorkshopSubjectsUpdateRequest' },
                required: true

      response '200', 'Workshop Subject updated' do
        schema '$ref' => '#/components/schemas/WorkshopSubjectsUpdateRequest'

        examples 'application/json' => {
          data: {
            id: '2',
            type: 'workshop_subjects',
            links: { self: 'http://www.example.com/api/v2/administration/workshop_subjects/2' },
            attributes: {
              attendance_status: 'no_show',
              attended: false,
              preworks: '2/3',
              workshop_activities: '2/3'
            },
            relationships: {
              user: {
                links: {
                  self: 'http://www.example.com/api/v2/administration/workshop_subjects/2/relationships/user',
                  related: 'http://www.example.com/api/v2/administration/workshop_subjects/2/user'
                },
                data: { type: 'users', id: '8' }
              }
            }
          }
        }

        let(:subject) { create(:workshop_subject, workshop: workshop, attended: true, attendance_status: 'no_status') }
        let(:subject_id) { subject.id }
        let(:body) do
          {
            data: {
              id: subject_id.to_s,
              type: 'workshop_subjects',
              attributes: {
                attended: false
              }
            }
          }
        end

        run_test! do |response|
          subject_response = JSON.parse(response.body)['data']
          expect(subject_response).to have_attribute(:attended).with_value(false)
          expect(subject_response).to have_attribute(:attendance_status).with_value('no_show')
        end
      end
    end

    delete 'Delete Workshop Subject' do
      operationId 'DeleteWorkshopsSubjects'
      description 'Delete Workshop Subject'
      tags 'Campaign Scheduling'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :workshop_id, in: :path, type: :string
      parameter name: :subject_id, in: :path, type: :string

      let(:subject_id) { subject.id }

      response '204', 'Workshop Subject deleted' do
        run_test! do |response|
          expect(response.body).to eq('')
          expect { WorkshopSubject.find(subject_id) }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end
    end
  end
end
