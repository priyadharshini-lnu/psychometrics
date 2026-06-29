# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::WorkshopInvitesController, type: :request do
  let!(:project) { create(:project, subdomain: 'project-subdomain') }
  let!(:campaign) { create(:campaign, project: project) }
  let!(:campaign_id) { campaign.id }
  let!(:superadmin) { create(:superadmin) }
  let!(:workshop) { create(:workshop, campaign: campaign) }
  let!(:workshop2) { create(:workshop, campaign: campaign) }
  let!(:workshop_invite) { create(:workshop_invite, campaign_assessment_group: campaign_assessment_group) }
  let!(:workshop_invite_id) { workshop_invite.id }
  let!(:user1) { create(:user, email: 'user1@test.test') }
  let!(:campaign_assessment_group) { create(:campaign_assessment_group, campaign: campaign) }

  before do
    sign_in(superadmin)
  end

  describe 'GET /campaigns/:campaign_id/workshop_invites' do
    it 'fetches Workshop list' do
      get "/api/v2/administration/campaigns/#{campaign_id}/workshop_invites",
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      workshops = JSON.parse(response.body)
      workshop_response = workshops['data'].find { |c| c['id'] == workshop_invite.id.to_s }
      expect(workshop_response).to have_key('id')
    end
  end

  describe 'POST /campaigns/:campaign_id/workshop_invites' do
    before do
      create(:campaign_user, campaign: campaign, user: user1)
    end

    it 'creates a Workshop Invite' do
      campaign_assessment_group = create(:campaign_assessment_group, campaign: campaign)

      body = {
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

      post "/api/v2/administration/campaigns/#{campaign_id}/workshop_invites",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

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

  describe 'DELETE /campaigns/:campaign_id/workshop_invites/:workshop_invite_id' do
    it 'deletes Workshop Invite' do
      delete "/api/v2/administration/campaigns/#{campaign_id}/workshop_invites/#{workshop_invite_id}",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(WorkshopInvite.exists?(id: workshop_invite_id)).to be_falsey
    end
  end
end
