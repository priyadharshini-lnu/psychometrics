# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::WorkshopInvitedSubjectsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:workshop_invite) { create(:workshop_invite) }
  let!(:workshop_invite_id) { workshop_invite.id }
  let!(:campaign_id) { workshop_invite.campaign_id }
  let(:'filter[workshop_invite_campaign_id_eq]') { workshop_invite.campaign_id.to_s }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }
  let(:user) { create(:user) }

  before do
    sign_in(superadmin)
  end

  path '/campaigns/{campaign_id}/workshop_invited_subjects' do
    get 'Get Workshop Invited Subject List' do
      operationId 'WorkshopInvitedSubjectList'
      description 'Fetch Workshop Invited Subject List'
      tags 'WorkshopInvitedSubject'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string, required: true
      parameter name: :'filter[workshop_invite_campaign_id_eq]', in: :query, required: true

      response '200', 'WorkshopInvitedSubject list' do
        schema '$ref' => '#/components/schemas/WorkshopInvitedSubjectListResponse'

        examples 'application/json' => [{
          data: [
            {
              id: 2,
              type: 'workshop_invited_subjects',
              attributes: { status: 'requested_cancellation', reason: nil, booked_workshop_date_time: nil },
              relationships: {
                user: {
                  data: { type: 'users', id: 5 }
                },
                workshop_invite: {
                  data: { type: 'workshop_invites', id: '1' }
                }
              }
            }
          ]
        }]

        let!(:workshop_invited_subject) do
          create(
            :workshop_invited_subject,
            workshop_invite: workshop_invite,
            workshop_subject: create(:workshop_subject, workshop: workshop_invite.workshops.first),
            status: 'requested_rescheduling'
          )
        end
        %w[pending requested_cancellation requested_cancellation_rejected
           requested_rescheduling_rejected].each do |status|
          let!("#{status}_subject") do
            create(
              :workshop_invited_subject,
              workshop_invite: workshop_invite,
              workshop_subject: create(:workshop_subject, workshop: workshop_invite.workshops.first),
              status: status
            )
          end
        end

        run_test! do |response|
          invited_subjects = JSON.parse(response.body)
          invited_subject_res = invited_subjects['data'].find { |w| w['id'] == workshop_invited_subject.id.to_s }
          expect(invited_subject_res).to have_key('id')
          expect(invited_subject_res).to have_attribute('status').with_value('requested_rescheduling')
          expect(invited_subject_res).to have_relationship(:user).
            with_data({ 'id' => workshop_invited_subject.user_id.to_s, 'type' => 'users' })
          expect(invited_subject_res).to have_relationship(:workshop_invite).
            with_data({ 'id' => workshop_invited_subject.workshop_invite_id.to_s, 'type' => 'workshop_invites' })
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/workshop_invited_subjects/{id}/reject_request' do
    post 'Reject Workshop Invited Subject Request' do
      operationId 'WorkshopInvitedSubjectRejectRequest'
      description 'Reject Workshop Invited Subject Request'
      tags 'WorkshopInvitedSubject'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string, required: true
      parameter name: :id, in: :path, type: :string, required: true

      response '200', 'WorkshopInvitedSubject list' do
        schema '$ref' => '#/components/schemas/WorkshopInvitedSubjectResponse'

        examples 'application/json' => [{
          data: {
            id: 2,
            type: 'workshop_invited_subjects',
            attributes: { status: 'requested_rescheduling_rejected', reason: nil, booked_workshop_date_time: nil },
            relationships: {
              user: {
                data: { type: 'users', id: 5 }
              },
              workshop_invite: {
                data: { type: 'workshop_invites', id: '1' }
              }
            }
          }
        }]

        let!(:workshop_invited_subject) do
          create(
            :workshop_invited_subject,
            workshop_invite: workshop_invite,
            workshop_subject: workshop_subject,
            status: 'requested_rescheduling'
          )
        end
        let!(:workshop_subject) do
          create(:workshop_subject, workshop: workshop_invite.workshops.first)
        end
        let(:id) { workshop_invited_subject.id }

        run_test! do |response|
          invited_subjects = JSON.parse(response.body)
          invited_subject_res = invited_subjects['data']
          expect(invited_subject_res).to have_key('id')
          expect(invited_subject_res).to have_attribute('status').with_value('requested_rescheduling_rejected')
          expect(invited_subject_res).to have_relationship(:user).
            with_data({ 'id' => workshop_invited_subject.user_id.to_s, 'type' => 'users' })
          expect(invited_subject_res).to have_relationship(:workshop_invite).
            with_data({ 'id' => workshop_invited_subject.workshop_invite_id.to_s, 'type' => 'workshop_invites' })
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/workshop_invited_subjects/{id}/accept_request' do
    post 'Accept Workshop Invited Subject Request' do
      operationId 'WorkshopInvitedSubjectAcceptRequest'
      description 'Accept Workshop Invited Subject Request'
      tags 'WorkshopInvitedSubject'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string, required: true
      parameter name: :id, in: :path, type: :string, required: true

      response '200', 'WorkshopInvitedSubject list' do
        schema '$ref' => '#/components/schemas/WorkshopInvitedSubjectResponse'

        examples 'application/json' => [{
          data: {
            id: 2,
            type: 'workshop_invited_subjects',
            attributes: { status: 'requested_rescheduling_accepted', reason: nil, booked_workshop_date_time: nil },
            relationships: {
              user: {
                data: { type: 'users', id: 5 }
              },
              workshop_invite: {
                data: { type: 'workshop_invites', id: '1' }
              }
            }
          }
        }]

        let!(:workshop_subject) do
          create(:workshop_subject, workshop: workshop_invite.workshops.first)
        end
        let!(:workshop_invited_subject) do
          create(
            :workshop_invited_subject,
            workshop_invite: workshop_invite,
            user: workshop_subject.user,
            workshop_subject: workshop_subject,
            status: 'requested_cancellation'
          )
        end
        let(:id) { workshop_invited_subject.id }

        run_test! do |response|
          invited_subjects = JSON.parse(response.body)
          invited_subject_res = invited_subjects['data']
          expect(invited_subject_res).to have_key('id')
          expect(invited_subject_res).to have_attribute('status').with_value('cancelled')
          expect(invited_subject_res).to have_relationship(:user).
            with_data({ 'id' => workshop_invited_subject.user_id.to_s, 'type' => 'users' })
          expect(invited_subject_res).to have_relationship(:workshop_invite).
            with_data({ 'id' => workshop_invited_subject.workshop_invite_id.to_s, 'type' => 'workshop_invites' })
        end
      end
    end
  end
end
