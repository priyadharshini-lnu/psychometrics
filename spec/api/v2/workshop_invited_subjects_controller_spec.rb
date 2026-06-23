# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::WorkshopInvitedSubjectsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:workshop_invite) { create(:workshop_invite) }
  let!(:workshop_invite_id) { workshop_invite.id }
  let!(:campaign_id) { workshop_invite.campaign_id }
  let(:user) { create(:user) }

  before do
    sign_in(superadmin)
  end

  describe 'GET /campaigns/{campaign_id}/workshop_invited_subjects' do
    it 'Get Workshop Invited Subject List' do
      workshop_invited_subject = create(
        :workshop_invited_subject,
        workshop_invite: workshop_invite,
        workshop_subject: create(:workshop_subject, workshop: workshop_invite.workshops.first),
        status: 'requested_rescheduling'
      )

      %w[pending requested_cancellation requested_cancellation_rejected
         requested_rescheduling_rejected].each do |status|
        create(
          :workshop_invited_subject,
          workshop_invite: workshop_invite,
          workshop_subject: create(:workshop_subject, workshop: workshop_invite.workshops.first),
          status: status
        )
      end

      get "/api/v2/administration/campaigns/#{campaign_id}/workshop_invited_subjects",
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
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

  describe 'POST /campaigns/{campaign_id}/' \
           'workshop_invited_subjects/{id}/reject_request' do
    it 'Reject Workshop Invited Subject Request' do
      workshop_subject = create(:workshop_subject, workshop: workshop_invite.workshops.first)
      workshop_invited_subject = create(
        :workshop_invited_subject,
        workshop_invite: workshop_invite,
        workshop_subject: workshop_subject,
        status: 'requested_rescheduling'
      )

      post "/api/v2/administration/campaigns/#{campaign_id}/workshop_invited_subjects/" \
           "#{workshop_invited_subject.id}/reject_request",
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
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

  describe 'POST /campaigns/{campaign_id}/' \
           'workshop_invited_subjects/{id}/accept_request' do
    it 'Accept Workshop Invited Subject Request' do
      workshop_invite.workshops.first.update(booked_seats: 1)
      workshop_subject = create(:workshop_subject, workshop: workshop_invite.workshops.first)
      workshop_invited_subject = create(
        :workshop_invited_subject,
        workshop_invite: workshop_invite,
        user: workshop_subject.user,
        workshop_subject: workshop_subject,
        status: 'requested_cancellation'
      )

      post "/api/v2/administration/campaigns/#{campaign_id}/workshop_invited_subjects/" \
           "#{workshop_invited_subject.id}/accept_request",
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
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
