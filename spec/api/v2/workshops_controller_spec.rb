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
  let!(:user2) { create(:user, email: 'user2@test.test') }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }
  let!(:manager) { workshop.workshop_managers.first }
  let!(:assessor) { workshop.workshop_assessors.first }
  let!(:campaign_admin) { create(:user, role: User::ADMIN_ROLE) }
  let!(:workshop_view_membership_grant) do
    create(:membership_grants, data: { workshops: %w[view manage],
                                       campaigns: %w[view] })
  end

  let!(:membership) do
    create(:campaign_admin_membership, grants: workshop_view_membership_grant, user: campaign_admin, campaign: campaign)
  end
  let!(:workshop_without_subject) { create(:workshop, campaign: campaign) }
  let!(:workshop_without_subject_id) { workshop_without_subject.id }
  let(:campaign_assessment_group) { create(:campaign_assessment_group, campaign: campaign) }

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

  path '/campaigns/{campaign_id}/workshops/{workshop_without_subject_id}/remove_workshop' do
    before do
      sign_in(campaign_admin)
    end

    after do
      sign_out(campaign_admin)
    end

    delete 'Remove Workshop' do
      operationId 'RemoveWorkshop'
      description 'Remove Workshop'
      tags 'Workshops'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :workshop_without_subject_id, in: :path, type: :string

      response '200', 'Remove Workshop' do
        run_test! do |response|
          expect(response.status).to be(200)
          expect { Workshop.find(workshop_without_subject_id) }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end
    end
  end

  describe '/campaigns/{campaign_id}/workshops/{workshop_id}/remove_workshop' do
    before do
      sign_in(campaign_admin)
    end

    after do
      sign_out(campaign_admin)
    end

    context 'When workshop has subject' do
      it 'gets does not get deleted and returns error' do
        delete "/api/v2/administration/campaigns/#{campaign_id}/workshops/#{workshop.id}/remove_workshop"
        data = JSON.parse(response.body)['errors']
        expect(response.status).to be(422)
        expect(data[0]['code']).to include('error')
      end
    end
  end

  path '/campaigns/{campaign_id}/workshops/{workshop_id}/bulk_update_subjects' do
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
      parameter name: :campaign_id, in: :path, type: :string
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

  path '/campaigns/{campaign_id}/workshops/{workshop_id}' do
    put 'Update workshop' do
      operationId 'UpdateWorkshop'
      description 'Update workshop'
      tags 'Workshops'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :workshop_id, in: :path, type: :string
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body,
                schema: { '$ref' => '#/components/schemas/WorkshopUpdateRequest' },
                required: true

      response '200', 'UpdateWorkshop' do
        schema '$ref' => '#/components/schemas/WorkshopResponse'
        examples 'application/json' => {
          data: {
            type: 'workshops',
            id: '1',
            attributes: {
              total_seats: 20,
              name: 'name',
              video_call_type: 'custom',
              meeting_link: 'https://www.abc.com',
              workshop_assessors_ids: [1],
              workshop_managers_ids: [1],
              scheduling_lead_time: 60,
              cancellation_lead_time: 60,
              allow_late_cancellation_and_rescheduling: false,
              campaign_assessment_group_id: '1'
            }
          }
        }

        let(:body) do
          {
            data: {
              type: 'workshops',
              id: workshop_id.to_s,
              attributes: {
                total_seats: 20,
                name: 'name',
                video_call_type: 'custom',
                meeting_link: 'https://www.abc.com',
                workshop_assessors_ids: [assessor.user_id.to_s, user1.id.to_s],
                workshop_managers_ids: [user2.id.to_s],
                scheduling_lead_time: 60,
                cancellation_lead_time: 60,
                allow_late_cancellation_and_rescheduling: false,
                campaign_assessment_group_id: campaign_assessment_group.id.to_s
              }
            }
          }
        end

        run_test! do |_|
          expect(workshop.reload.total_seats).to eq(20)
          expect(workshop.name).to eq('name')
          expect(workshop.meeting_link).to eq('https://www.abc.com')
          expect(workshop.workshop_assessors.count).to eq(2)
          expect(workshop.workshop_assessors).to include(WorkshopAssessor.find_by(user_id: user1.id))
          expect(workshop.workshop_assessors).to include(assessor)
          expect(workshop.workshop_managers).to include(WorkshopManager.find_by(user_id: user2.id))
          expect(workshop.workshop_managers).not_to include(manager)
          expect(workshop.workshop_managers.count).to eq(1)
          expect(workshop.scheduling_lead_time).to eq(60)
          expect(workshop.cancellation_lead_time).to eq(60)
          expect(workshop.allow_late_cancellation_and_rescheduling).to eq(false)
          expect(workshop.campaign_assessment_group_id).to eq(campaign_assessment_group.id)
        end
      end
    end
  end
end
