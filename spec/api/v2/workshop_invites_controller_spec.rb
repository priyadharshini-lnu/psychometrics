# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::WorkshopInvitesController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:project) { create(:project, subdomain: 'project-subdomain') }
  let!(:campaign) { create(:campaign, project: project) }
  let!(:superadmin) { create(:superadmin) }
  let!(:workshop_invite) { create(:workshop_invite) }
  let!(:workshop_invite_id) { workshop_invite.id }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }
  let!(:user1) { create(:user, email: 'user1@test.test') }

  before { sign_in(superadmin) }

  path '/workshop_invites' do
    get 'Get Workshop List' do
      operationId 'WorkshopList'
      description 'Fetch Workshop list'

      tags 'Workshop'
      consumes 'application/json'
      security [basic: []]

      response '200', 'Workshop list' do
        schema '$ref' => '#/components/schemas/WorkshopListResponse'

        examples 'application/json' => [{
          type: 'workshop_invites',
          data: {
            id: '1',
            attributes: {
              title: 'Workshop title',
              description: 'Workshop description',
              subjects_count: 1,
              allow_language_preference: true,
              allow_neurodiversity_option: true
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

  path '/workshop_invites' do
    post 'Create a Workshop Invite' do
      operationId 'CreateWorkshop'
      description 'Create new Workshop'
      tags 'Workshops'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :body, in: :body,
                schema: { '$ref' => '#/components/schemas/WorkshopCreateRequest' },
                required: true

      response '201', 'Workshop Created' do
        schema '$ref' => '#/components/schemas/WorkshopResponse'
        examples 'application/json' => {
          data: {
            type: 'workshop_invites',
            attributes: {
              title: 'Workshop title',
              description: 'Workshop description',
              subjects_count: 1,
              allow_language_preference: true,
              allow_neurodiversity_option: true
            }
          }
        }

        let(:body) do
          {
            filter: {
              workshops_campaign_id_eq: campaign.id
            },
            data: {
              type: 'workshop_invites',
              attributes: {
                allow_language_preference: true,
                allow_neurodiversity_option: true,
                allowed_languages: []
              }
            }
          }
        end

        run_test! do |response|
          workshop_invite_response = JSON.parse(response.body)['data']
          expect(workshop_invite_response).to have_key('id')
        end
      end
    end
  end

  path '/workshop_invites/{workshop_invite_id}/create_subjects_and_translations' do
    before do
      create(:campaign_user, campaign: campaign, user: user1)
    end
    post 'Create a subjects and translations' do
      operationId 'CreateWorkshop'
      description 'Create subjects and translations'
      tags 'Workshops'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :workshop_invite_id, in: :path, type: :string
      parameter name: :body, in: :body,
                schema: { '$ref' => '#/components/schemas/WorkshopInviteCreateSubjectsAndTranslations' },
                required: true

      response '200', 'Workshop a subjects and translations created' do
        let(:body) do
          {
            type: 'workshop_invites',
            data: {
              id: workshop_invite_id,
              attributes: {
                subjects: [{ user_id: user1.id }],
                translations: [
                  { locale: 'en', title: 'title', description: 'description' },
                  { locale: 'ar', title: 'arabic', description: 'ar_description' }
                ]
              }
            }
          }
        end

        run_test! do
          expect(workshop_invite.workshop_invited_subjects.count).to eq(1)
          expect(workshop_invite.workshop_invited_subjects.first.user).to eq(user1)
          expect(workshop_invite.reload.title).to eq('title')
          expect(workshop_invite.reload.description).to eq('description')
          expect(workshop_invite.translations.find_by(locale: :ar).title).to eq('arabic')
          expect(workshop_invite.translations.find_by(locale: :ar).description).to eq('ar_description')
        end
      end
    end
  end
end
