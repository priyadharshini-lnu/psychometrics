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
  let!(:workshop_invite) { create(:workshop_invite) }
  let!(:workshop_invite_id) { workshop_invite.id }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }
  let!(:user1) { create(:user, email: 'user1@test.test') }

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

  path '/campaigns/{campaign_id}/workshop_invites' do
    before { create(:campaign_user, campaign: campaign, user: user1) }
    post 'Create a Workshop Invite' do
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
        examples 'application/json' => {
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

        let(:body) do
          {
            data: {
              type: 'workshop_invites',
              attributes: {
                allow_language_preference: true,
                allow_neurodiversity_option: true,
                allowed_languages: [],
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
end
