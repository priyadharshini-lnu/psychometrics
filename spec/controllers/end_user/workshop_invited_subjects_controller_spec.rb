# frozen_string_literal: true

require 'rails_helper'

describe EndUser::WorkshopInvitedSubjectsController, type: :controller do
  let(:current_password) { 'Current@Password129' }
  let!(:user) { create(:user, :with_project_membership, password: current_password) }

  let!(:assessment_group) { create(:campaign_assessment_group) }
  let!(:workshop) do
    create(:workshop,
           booked_seats: 0,
           total_seats: 10,
           start_time: 1.day.from_now,
           timezone: 'Asia/Dubai',
           video_call_type: :not_available,
           campaign_assessment_group: assessment_group)
  end
  let!(:workshop_invite) do
    create(:workshop_invite,
           workshops: [workshop],
           campaign_assessment_group: assessment_group)
  end
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
    context 'with basic fields' do
      it 'returns existing fields unchanged for backward compatibility' do
        get :invites, params: { type: 'invites' }

        parsed_response = response.parsed_body

        expect(response.status).to eq(200)
        expect(parsed_response['list'].count).to eq(1)

        item = parsed_response['list'][0]
        expect(item['id']).to eq(invite.id)
        expect(item['status']).to eq(invite.status)
        expect(item['title']).to eq(workshop_invite.title)
        expect(item['description']).to eq(workshop_invite.description)
        expect(item['duration']).to eq(workshop.duration)
        expect(item['workshop_invite_id']).to eq(workshop_invite.id)
      end
    end

    context 'with new fields' do
      it 'returns slots_count as total number of workshops on the invite' do
        second_workshop = create(:workshop,
                                 booked_seats: 0,
                                 total_seats: 5,
                                 start_time: 2.days.from_now,
                                 campaign_assessment_group: assessment_group)
        workshop_invite.workshops << second_workshop

        get :invites, params: { type: 'invites' }

        item = response.parsed_body['list'][0]
        expect(item['slots_count']).to eq(2)
      end

      it 'returns seats_available as sum of remaining seats across all workshops' do
        second_workshop = create(:workshop,
                                 booked_seats: 3,
                                 total_seats: 8,
                                 start_time: 2.days.from_now,
                                 campaign_assessment_group: assessment_group)
        workshop_invite.workshops << second_workshop

        get :invites, params: { type: 'invites' }

        item = response.parsed_body['list'][0]
        expect(item['seats_available']).to eq(15)
      end

      it 'returns meeting_type as in_person when video_call_type is not_available' do
        get :invites, params: { type: 'invites' }

        item = response.parsed_body['list'][0]
        expect(item['meeting_type']).to eq('in_person')
      end

      it 'returns meeting_type as online when video_call_type is internal' do
        workshop.update!(video_call_type: :internal)

        get :invites, params: { type: 'invites' }

        item = response.parsed_body['list'][0]
        expect(item['meeting_type']).to eq('online')
      end

      it 'returns meeting_type as online when video_call_type is custom' do
        workshop.update!(video_call_type: :custom)

        get :invites, params: { type: 'invites' }

        item = response.parsed_body['list'][0]
        expect(item['meeting_type']).to eq('online')
      end

      it 'returns upcoming_slot_date as ISO 8601 UTC string of the next bookable slot' do
        get :invites, params: { type: 'invites' }

        item = response.parsed_body['list'][0]
        expect(item['upcoming_slot_date']).to eq(workshop.start_time.utc.iso8601)
      end

      it 'does not return upcoming_slot_timezone' do
        get :invites, params: { type: 'invites' }

        item = response.parsed_body['list'][0]
        expect(item).not_to have_key('upcoming_slot_timezone')
      end

      it 'falls back to nearest future start_time when all slots are fully booked' do
        workshop.update!(booked_seats: workshop.total_seats)

        get :invites, params: { type: 'invites' }

        item = response.parsed_body['list'][0]
        expect(item['upcoming_slot_date']).to eq(workshop.start_time.utc.iso8601)
      end

      it 'falls back to nearest future start_time when booking window has passed' do
        future_workshop = create(:workshop,
                                 booked_seats: 0,
                                 total_seats: 5,
                                 start_time: 3.days.from_now,
                                 scheduling_lead_time: 5.days.to_i,
                                 campaign_assessment_group: assessment_group)
        workshop_invite.workshops << future_workshop

        get :invites, params: { type: 'invites' }

        item = response.parsed_body['list'][0]
        expect(item['upcoming_slot_date']).to eq(workshop.start_time.utc.iso8601)
      end

      it 'returns nil for upcoming_slot_date when all workshops are in the past' do
        workshop.update!(start_time: 1.day.ago)

        get :invites, params: { type: 'invites' }

        item = response.parsed_body['list'][0]
        expect(item['upcoming_slot_date']).to be_nil
      end

      it 'returns assessment_group at top level with id, name, and invite_ids' do
        get :invites, params: { type: 'invites' }

        parsed_response = response.parsed_body

        expect(parsed_response).to have_key('assessment_group')
        group = parsed_response['assessment_group']
        expect(group).to be_an(Array)
        expect(group.length).to eq(1)
        expect(group[0]['id']).to eq(assessment_group.id)
        expect(group[0]['name']).to eq(assessment_group.name)
        expect(group[0]['invite_ids']).to contain_exactly(invite.id)
      end

      it 'returns invite_ids matching list item IDs — scoped to current user only' do
        other_user = create(:user, :with_project_membership)
        other_subject = create(:workshop_invited_subject,
                               workshop_invite: workshop_invite,
                               user: other_user)

        get :invites, params: { type: 'invites' }

        group = response.parsed_body['assessment_group']
        expect(group[0]['invite_ids']).to contain_exactly(invite.id)
        expect(group[0]['invite_ids']).not_to include(other_subject.id)
      end

      it 'returns all current user invite_ids across multiple invites in the same group' do
        second_invite = create(:workshop_invite,
                               campaign: workshop_invite.campaign,
                               campaign_assessment_group: assessment_group)
        second_subject = create(:workshop_invited_subject,
                                workshop_invite: second_invite,
                                user: user)

        get :invites, params: { type: 'invites' }

        group = response.parsed_body['assessment_group']
        expect(group[0]['invite_ids']).to contain_exactly(invite.id, second_subject.id)
      end

      it 'returns multiple assessment_group entries when invites span different groups' do
        other_group = create(:campaign_assessment_group)
        other_invite = create(:workshop_invite,
                              campaign: workshop_invite.campaign,
                              campaign_assessment_group: other_group)
        create(:workshop_invited_subject, workshop_invite: other_invite, user: user)

        get :invites, params: { type: 'invites' }

        group = response.parsed_body['assessment_group']
        expect(group.length).to eq(2)
        group_ids = group.pluck('id')
        expect(group_ids).to contain_exactly(assessment_group.id, other_group.id)
      end

      it 'returns empty assessment_group array when no invites have an assessment group' do
        workshop_invite.update!(campaign_assessment_group: nil)

        get :invites, params: { type: 'invites' }

        expect(response.parsed_body['assessment_group']).to eq([])
      end

      it 'does not include assessment_group inside each list item' do
        get :invites, params: { type: 'invites' }

        item = response.parsed_body['list'][0]
        expect(item).not_to have_key('assessment_group')
      end
    end

    context 'with multiple workshops on the same invite' do
      it 'returns slots_count as the total count of all workshops' do
        create_list(:workshop, 2,
                    booked_seats: 0,
                    total_seats: 5,
                    start_time: 3.days.from_now,
                    campaign_assessment_group: assessment_group).each do |w|
          workshop_invite.workshops << w
        end

        get :invites, params: { type: 'invites' }

        item = response.parsed_body['list'][0]
        expect(item['slots_count']).to eq(3)
      end

      it 'returns next bookable slot date as the earliest bookable workshop start_time' do
        earlier_workshop = create(:workshop,
                                  booked_seats: 0,
                                  total_seats: 5,
                                  start_time: 6.hours.from_now,
                                  campaign_assessment_group: assessment_group)
        workshop_invite.workshops << earlier_workshop

        get :invites, params: { type: 'invites' }

        item = response.parsed_body['list'][0]
        expect(item['upcoming_slot_date']).to eq(earlier_workshop.start_time.utc.iso8601)
      end
    end
  end

  describe 'GET bookings' do
    it 'returns bookings' do
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
