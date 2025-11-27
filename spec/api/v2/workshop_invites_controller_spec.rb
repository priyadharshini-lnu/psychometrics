# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::WorkshopInvitesController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:project) { create(:project, subdomain: 'project-subdomain') }
  let!(:campaign) { create(:campaign, project: project) }
  let!(:campaign_id) { campaign.id }
  let!(:superadmin) { create(:superadmin) }
  let!(:workshop) { create(:workshop, campaign: campaign) }
  let!(:workshop2) { create(:workshop, campaign: campaign) }
  let!(:workshop_invite) { create(:workshop_invite, campaign_assessment_group: campaign_assessment_group) }
  let!(:workshop_invite_id) { workshop_invite.id }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }
  let!(:user1) { create(:user, email: 'user1@test.test') }
  let!(:campaign_assessment_group) { create(:campaign_assessment_group, campaign: campaign) }

  before do
    sign_in(superadmin)
  end

  path '/campaigns/{campaign_id}/workshop_invites' do
    get 'Get Workshop List' do
      operationId 'WorkshopList'
      description 'Fetch Workshop list'

      tags 'Workshop'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string

      response '200', 'Workshop list' do
        schema '$ref' => '#/components/schemas/WorkshopInviteListResponse'

        examples 'application/json' => [{
          type: 'workshop_invites',
          data: {
            id: '1',
            attributes: {
              title: 'Workshop title',
              description: 'Workshop description',
              subjects_count: 1,
              allow_language_preference: true,
              allow_neurodiversity_option: true,
              campaign_assessment_group_id: '1',
              campaign_assessment_group_name: 'Group Name'
            }
          }
        }]

        run_test! do |response|
          workshops = JSON.parse(response.body)
          workshop_response = workshops['data'].find { |c| c['id'] == workshop_invite.id.to_s }
          expect(workshop_response).to have_key('id')
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/workshop_invites' do
    before do
      create(:campaign_user, campaign: campaign, user: user1)
    end

    post 'Create a Workshop Invite' do
      let(:campaign_assessment_group) { create(:campaign_assessment_group, campaign: campaign) }

      operationId 'CreateWorkshop'
      description 'Create new Workshop'
      tags 'Workshops'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body,
                schema: { '$ref' => '#/components/schemas/WorkshopCreateRequest' },
                required: true

      response '200', 'Workshop Created' do
        schema '$ref' => '#/components/schemas/WorkshopInviteResponse'

        let(:example_response) do
          {
            data: {
              type: 'workshop_invites',
              attributes: {
                title: 'Workshop title',
                description: 'Workshop description',
                subjects_count: 1,
                allow_language_preference: true,
                allow_neurodiversity_option: true,
                subjects: [{ user_id: '111' }],
                translations: [
                  { locale: 'en', title: 'title', description: 'description' },
                  { locale: 'ar', title: 'arabic', description: 'ar_description' }
                ],
                workshop_ids: ['1']
              }
            }
          }
        end

        examples 'application/json' => :example_response

        let(:body) do
          {
            data: {
              type: 'workshop_invites',
              attributes: {
                allow_language_preference: true,
                allow_neurodiversity_option: true,
                allowed_languages: [],
                campaign_assessment_group_id: campaign_assessment_group.id.to_s,
                subjects: [{ user_id: user1.id.to_s }],
                translations: [
                  { locale: 'en', title: 'title', description: 'description' },
                  { locale: 'ar', title: 'arabic', description: 'ar_description' }
                ],
                workshop_ids: [workshop.id.to_s, workshop2.id.to_s]
              }
            }
          }
        end

        run_test! do |response|
          workshop_invite_response = JSON.parse(response.body)['data']
          expect(workshop_invite_response).to have_key('id')

          workshop_invite = WorkshopInvite.find(workshop_invite_response['id'])

          expect(AdminJobRecord.exists?(operation: 'bulk_create_workshop_invites')).to be_truthy

          expect(workshop_invite.reload.title).to eq('title')
          expect(workshop_invite.reload.description).to eq('description')
          expect(workshop_invite.translations.find_by(locale: :ar).title).to eq('arabic')
          expect(workshop_invite.translations.find_by(locale: :ar).description).to eq('ar_description')
          expect(workshop_invite.workshops.count).to eq(2)
          expect(workshop_invite.workshops).to include(workshop)
          expect(workshop_invite.workshops).to include(workshop2)
          expect(workshop_invite.campaign_assessment_group_id).to eq(campaign_assessment_group.id)
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/workshop_invites/{workshop_invite_id}' do
    delete 'Delete Workshop Invite' do
      operationId 'DeleteWorkshopInvite'
      description 'Delete Workshop Invite'
      tags 'Workshop'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :workshop_invite_id, in: :path, type: :string

      response '204', 'Workshop Invite Deleted' do
        run_test! do |_|
          expect(WorkshopInvite.exists?(id: workshop_invite_id)).to be_falsey
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/workshop_invites/validate_subjects' do
    post 'Validate Subjects for Assessment Group Conflicts' do
      operationId 'ValidateSubjects'
      description 'Validate subjects to check for conflicts within the same assessment group'
      tags 'Workshop'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: {
        type: :object,
        properties: {
          campaign_assessment_group_id: { type: :string },
          user_ids: { type: :array, items: { type: :string } }
        },
        required: %w[campaign_assessment_group_id user_ids]
      }

      let!(:user2) { create(:user, email: 'user2@test.test') }
      let!(:user3) { create(:user, email: 'user3@test.test') }
      let!(:campaign_user1) { create(:campaign_user, campaign: campaign, user: user1) }
      let!(:campaign_user2) { create(:campaign_user, campaign: campaign, user: user2) }
      let!(:campaign_user3) { create(:campaign_user, campaign: campaign, user: user3) }

      response '200', 'Validation successful with no conflicts' do
        schema type: :object,
               properties: {
                 validation_errors: { type: :array, items: { type: :string } }
               }

        let(:body) do
          {
            data: {
              type: 'workshop_invites',
              attributes: {
                campaign_assessment_group_id: campaign_assessment_group.id.to_s,
                user_ids: [user1.id.to_s, user2.id.to_s]
              }
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['validation_errors']).to be_empty
        end
      end

      response '200', 'Validation returns conflicts when users are already invited to assessment group' do
        schema type: :object,
               properties: {
                 validation_errors: { type: :array, items: { type: :string } }
               }

        let!(:other_workshop_invite) do
          create(:workshop_invite,
                 campaign: campaign,
                 campaign_assessment_group: campaign_assessment_group,
                 title: 'Existing Workshop Invite')
        end
        let!(:existing_invited_subject) do
          create(:workshop_invited_subject,
                 workshop_invite: other_workshop_invite,
                 user: user1)
        end

        let(:body) do
          {
            data: {
              type: 'workshop_invites',
              attributes: {
                campaign_assessment_group_id: campaign_assessment_group.id.to_s,
                user_ids: [user1.id.to_s, user2.id.to_s]
              }
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['validation_errors']).not_to be_empty
          expect(data['validation_errors'].size).to eq(1)
          expect(data['validation_errors'].first).to include(user1.email)
          expect(data['validation_errors'].first).to include('Existing Workshop Invite')
        end
      end

      response '200', 'Validation ignores conflicts from different assessment groups' do
        schema type: :object,
               properties: {
                 validation_errors: { type: :array, items: { type: :string } }
               }

        let!(:other_assessment_group) { create(:campaign_assessment_group, campaign: campaign) }
        let!(:other_workshop_invite) do
          create(:workshop_invite,
                 campaign: campaign,
                 campaign_assessment_group: other_assessment_group,
                 title: 'Different Group Workshop')
        end
        let!(:existing_subject_different_group) do
          create(:workshop_invited_subject,
                 workshop_invite: other_workshop_invite,
                 user: user1)
        end

        let(:body) do
          {
            data: {
              type: 'workshop_invites',
              attributes: {
                campaign_assessment_group_id: campaign_assessment_group.id.to_s,
                user_ids: [user1.id.to_s, user2.id.to_s]
              }
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['validation_errors']).to be_empty
        end
      end
    end
  end
end
