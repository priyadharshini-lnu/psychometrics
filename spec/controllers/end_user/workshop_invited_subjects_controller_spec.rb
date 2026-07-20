# frozen_string_literal: true

require 'rails_helper'

describe EndUser::WorkshopInvitedSubjectsController, type: :controller do
  let(:current_password) { 'Current@Password129' }
  let!(:user) { create(:user, :with_project_membership, password: current_password) }

  let!(:workshop) { create(:workshop) }
  let!(:workshop_invite) { create(:workshop_invite, workshops: [workshop]) }
  let!(:invite) do
    create(:workshop_invited_subject, workshop_invite: workshop_invite, user: user)
  end
  let!(:booking) do
    create(
      :workshop_invited_subject, workshop_invite: workshop_invite, user: user, status: 'cancelled'
    )
  end

  let(:workshop_subject) do
    create(:workshop_subject, workshop: workshop, user: user, campaign: workshop_invite.campaign)
  end

  let!(:campaign_user) do
    create(:campaign_user, user: user, campaign: workshop_invite.campaign, active: true)
  end

  before(:each) do
    login_user(user)
  end

  describe 'GET invites' do
    it 'returns invites' do
      get :invites, params: { type: 'invites' }

      parsed_response = response.parsed_body

      expect(response.status).to eq(200)
      expect(parsed_response['list'].count).to eq(1)
      expect(parsed_response['list'][0]['id']).to eq(invite.id)
      expect(parsed_response['list'][0]['status']).to eq(invite.status)
    end
  end

  describe 'GET bookings' do
    it 'returns bookinbgs' do
      workshop_subject

      get :bookings, params: { type: 'bookings' }

      parsed_response = response.parsed_body

      expect(response.status).to eq(200)
      expect(parsed_response['list'].count).to eq(1)
      expect(parsed_response['list'][0]['id']).to eq(booking.id)
      expect(parsed_response['list'][0]['status']).to eq(booking.status)
    end
  end
end
