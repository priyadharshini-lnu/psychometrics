# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::WorkshopInvitesController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:workshop_invite) { create(:workshop_invite) }
  let!(:workshop_invite_id) { workshop_invite.id }
  let!(:campaign_id) { workshop_invite.campaign_id }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }
  let(:user) { create(:user) }

  before do
    sign_in(superadmin)
  end

  path '/campaigns/{campaign_id}/workshop_invites/{workshop_invite_id}/workshop_invited_subjects' do
    get 'Get Workshop Invited Subject List' do
      operationId 'WorkshopInvitedSubjectList'
      description 'Fetch Workshop Invited Subject List'
      tags 'WorkshopInvitedSubject'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :workshop_invite_id, in: :path, type: :string, required: true
      parameter name: :campaign_id, in: :path, type: :string, required: true

      response '200', 'WorkshopInvitedSubject list' do
        schema '$ref' => '#/components/schemas/WorkshopInvitedSubjectListResponse'

        examples 'application/json' => [{
          type: 'workshop_invites',
          data: {
            id: '1',
            attributes: {
              status: 'pending'
            },
            relationships: {
              user: {
                data: {
                  id: '1',
                  type: 'users'
                }
              },
              workshop_invite: {
                data: {
                  id: '1',
                  type: 'workshop_invites'
                }
              }
            }
          }
        }]
        let!(:workshop_invited_subject) { create(:workshop_invited_subject, workshop_invite: workshop_invite) }

        run_test! do |response|
          invited_subjects = JSON.parse(response.body)
          invited_subject_res = invited_subjects['data'].find { |w| w['id'] == workshop_invited_subject.id.to_s }
          expect(invited_subject_res).to have_key('id')
          expect(invited_subject_res).to have_attribute('status').with_value('pending')
          expect(invited_subject_res).to have_relationship(:user).
            with_data({ 'id' => workshop_invited_subject.user_id.to_s, 'type' => 'users' })
          expect(invited_subject_res).to have_relationship(:workshop_invite).
            with_data({ 'id' => workshop_invited_subject.workshop_invite_id.to_s, 'type' => 'workshop_invites' })
        end
      end
    end

    post 'Create Workshop Invited Subject' do
      operationId 'CreateWorkshopInvitedSubject'
      description 'Create new Workshop Invited Subject'
      tags 'WorkshopInvitedSubject'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string, required: true
      parameter name: :workshop_invite_id, in: :path, type: :string, required: true
      parameter name: :body, in: :body,
                schema: { '$ref' => '#/components/schemas/WorkshopInvitedSubjectCreateRequest' }, required: true

      response '201', 'WorkshopInvitedSubject created' do
        schema '$ref' => '#/components/schemas/WorkshopInvitedSubjectResponse'

        examples 'application/json' => [{
          type: 'workshop_invites',
          data: {
            id: '1',
            attributes: {
              status: 'pending'
            },
            relationships: {
              user: {
                data: {
                  id: '1',
                  type: 'users'
                }
              },
              workshop_invite: {
                data: {
                  id: '1',
                  type: 'workshop_invites'
                }
              }
            }
          }
        }]
        let!(:body) do
          jsonapi_resource_request(
            'workshop_invited_subjects',
            {},
            { user: { id: user.id.to_s, type: 'users' },
              workshop_invite: { id: workshop_invite.id.to_s, type: 'workshop_invites' } }
          )
        end

        run_test! do |response|
          invited_subject = JSON.parse(response.body)
          expect(invited_subject['data']).to have_key('id')
          expect(invited_subject['data']).to have_attribute('status').with_value('pending')
          expect(invited_subject['data']).to have_relationship(:user).
            with_data({ 'id' => user.id.to_s, 'type' => 'users' })
          expect(invited_subject['data']).to have_relationship(:workshop_invite).
            with_data({ 'id' => workshop_invite.id.to_s, 'type' => 'workshop_invites' })
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/workshop_invites/{workshop_invite_id}/workshop_invited_subjects/{id}' do
    delete 'Delete Workshop Invited Subject' do
      operationId 'DeleteWorkshopInvitedSubject'
      description 'Delete Workshop Invited Subject'
      tags 'WorkshopInvitedSubject'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :id, in: :path, type: :string, required: true
      parameter name: :workshop_invite_id, in: :path, type: :string, required: true
      parameter name: :campaign_id, in: :path, type: :string, required: true

      response '204', 'WorkshopInvitedSubject deleted' do
        let!(:workshop_invited_subject) { create(:workshop_invited_subject, workshop_invite: workshop_invite) }
        let!(:id) { workshop_invited_subject.id.to_s }

        run_test! do |response|
          expect(response).to have_http_status(:no_content)
          expect(WorkshopInvitedSubject.find_by(id: id)).to eq(nil)
        end
      end
    end
  end
end
