# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::WorkshopInvitesController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:workshop_invite) { create(:workshop_invite) }
  let!(:workshop_invite_id) { workshop_invite.id }
  let!(:campaign_id) { workshop_invite.campaign_id }
  let(:user) { create(:user) }

  before do
    sign_in(superadmin)
  end

  describe 'GET /api/v2/administration/campaigns/:campaign_id/workshop_invites/' \
           ':workshop_invite_id/workshop_invited_subjects' do
    it 'fetches Workshop Invited Subject List' do
      workshop_invited_subject = create(:workshop_invited_subject, workshop_invite: workshop_invite)

      get "/api/v2/administration/campaigns/#{campaign_id}/workshop_invites/" \
          "#{workshop_invite_id}/workshop_invited_subjects",
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
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

  describe 'POST /api/v2/administration/campaigns/:campaign_id/workshop_invites/' \
           ':workshop_invite_id/workshop_invited_subjects' do
    it 'creates Workshop Invited Subject' do
      body = jsonapi_resource_request(
        'workshop_invited_subjects',
        {},
        { user: { id: user.id.to_s, type: 'users' },
          workshop_invite: { id: workshop_invite.id.to_s, type: 'workshop_invites' } }
      )

      post "/api/v2/administration/campaigns/#{campaign_id}/workshop_invites/" \
           "#{workshop_invite_id}/workshop_invited_subjects",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      invited_subject = JSON.parse(response.body)
      expect(invited_subject['data']).to have_key('id')
      expect(invited_subject['data']).to have_attribute('status').with_value('pending')
      expect(invited_subject['data']).to have_relationship(:user).
        with_data({ 'id' => user.id.to_s, 'type' => 'users' })
      expect(invited_subject['data']).to have_relationship(:workshop_invite).
        with_data({ 'id' => workshop_invite.id.to_s, 'type' => 'workshop_invites' })
    end
  end

  describe 'DELETE /api/v2/administration/campaigns/:campaign_id/workshop_invites/' \
           ':workshop_invite_id/workshop_invited_subjects/:id' do
    it 'deletes Workshop Invited Subject' do
      workshop_invited_subject = create(:workshop_invited_subject, workshop_invite: workshop_invite)

      delete "/api/v2/administration/campaigns/#{campaign_id}/workshop_invites/#{workshop_invite_id}/workshop_invited_subjects/#{workshop_invited_subject.id}", # rubocop:disable Layout/LineLength
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:no_content)
      expect(WorkshopInvitedSubject.find_by(id: workshop_invited_subject.id)).to eq(nil)
    end
  end
end
