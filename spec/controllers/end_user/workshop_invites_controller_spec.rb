# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::WorkshopInvitesController, type: :controller do
  let(:current_password) { 'Current@Password129' }
  let!(:user) { create(:user, :with_project_membership, password: current_password) }
  let!(:workshop) do
    create(:workshop, booked_seats: 0, total_seats: 10, start_time: Time.current.advance(days: 1))
  end
  let(:workshop_invite) do
    create(
      :workshop_invite, workshops: [workshop], allowed_languages: ['en, ar'],
      allow_neurodiversity_option: true, allow_language_preference: true
    )
  end
  let!(:workshop_invited_subject) do
    create(:workshop_invited_subject, user: user, workshop_invite: workshop_invite, status: 'pending')
  end
  let(:workshop_subject) do
    create(
      :workshop_subject,
      user: user,
      workshop: workshop,
      preferred_language: 'en',
      neurodivergent: true,
      neurodivergent_comments: 'comments',
      campaign: workshop_invite.campaign
    )
  end

  before(:each) do
    login_user(user)
  end

  describe 'GET show' do
    it 'returns the workshop invite' do
      get :fetch_invite, params: { id: workshop_invite.id }

      parsed_response = JSON.parse(response.body)

      expect(response.status).to eq(200)
      expect(parsed_response['id']).to eq(workshop_invite.id)
      expect(parsed_response['title']).to eq(workshop_invite.title)
      expect(parsed_response['description']).to eq(workshop_invite.description)
      expect(parsed_response['allow_language_preference']).to eq(workshop_invite.allow_language_preference)
      expect(parsed_response['allowed_languages']).to eq(workshop_invite.allowed_languages)
      expect(parsed_response['allow_neurodiversity_option']).to eq(workshop_invite.allow_neurodiversity_option)
      expect(parsed_response['available_dates'].count).to eq(workshop_invite.available_workshops_date_and_id.count)
      expect(parsed_response['available_dates']).to eq(
        [
          {
            'id' => workshop.id,
            'date' => workshop.start_time.iso8601
          }
        ]
      )
      expect(parsed_response['timezone']).to eq(workshop.timezone)
      expect(parsed_response['duration']).to eq(workshop.duration)
    end

    it 'returns the workshop booking' do
      workshop_invited_subject.update!(status: 'accepted')

      workshop_subject

      get :fetch_booking, params: { id: workshop_invite.id }

      parsed_response = JSON.parse(response.body)

      expect(response.status).to eq(200)
      expect(JSON.parse(response.body)['id']).to eq(workshop_invite.id)
      expect(parsed_response['title']).to eq(workshop_invite.title)
      expect(parsed_response['description']).to eq(workshop_invite.description)
      expect(parsed_response['status']).to eq(workshop_invited_subject.status)
      expect(parsed_response['workshop_id']).to eq(workshop.id)
      expect(parsed_response['preferred_language']).to eq(workshop_subject.preferred_language)
      expect(parsed_response['neurodivergent']).to eq(workshop_subject.neurodivergent)
      expect(parsed_response['neurodivergent_comments']).to eq(workshop_subject.neurodivergent_comments)
      expect(parsed_response['timezone']).to eq(workshop.timezone)
      expect(parsed_response['duration']).to eq(workshop.duration)
      expect(parsed_response['allow_language_preference']).to eq(workshop_invite.allow_language_preference)
      expect(parsed_response['reschedule_lead_time']).to eq(workshop.reschedule_lead_time)
      expect(parsed_response['cancellation_lead_time']).to eq(workshop.cancellation_lead_time)
      expect(parsed_response['allow_neurodiversity_option']).to eq(workshop_invite.allow_neurodiversity_option)
      expect(parsed_response['available_dates'].count).to eq(workshop_invite.available_workshops_date_and_id.count)
      expect(parsed_response['available_dates']).to eq(
        [
          {
            'id' => workshop.id,
            'date' => workshop.start_time.iso8601
          }
        ]
      )
      expect(parsed_response['booked_date']).to eq({
        'id' => workshop.id,
        'date' => workshop.start_time.iso8601
      })
      expect(parsed_response['allowed_languages']).to eq(workshop_invite.allowed_languages)
    end
  end

  describe 'POST book' do
    it 'returns error if all seats are booked' do
      workshop.update!(booked_seats: 1, total_seats: 1)

      post :book, params: {
        workshop_id: workshop.id,
        id: workshop_invite.id,
        workshop_subject_details: {
          preferred_language: 'en',
          neurodivergent: true,
          neurodivergent_comments: 'test'
        }
      }

      expect(response.status).to eq(400)
      expect(JSON.parse(response.body)['errors']).to eq(
        [I18n.t('administration.bookings.errors.seats_not_available')]
      )
    end

    it 'returns error if the user is already booked' do
      workshop.update!(booked_seats: 1, total_seats: 2)
      workshop_invited_subject.update!(status: 'accepted')
      workshop_subject

      post :book, params: {
        workshop_id: workshop.id,
        id: workshop_invite.id,
        workshop_subject_details: {
          preferred_language: 'en',
          neurodivergent: true,
          neurodivergent_comments: 'test'
        }
      }

      expect(response.status).to eq(400)
      expect(JSON.parse(response.body)['errors']).to eq(
        [I18n.t('administration.bookings.errors.already_booked')]
      )
    end

    it 'returns error if the user is already cancelled and lead_cancellation time has passed' do
      workshop.update!(
        booked_seats: 1, total_seats: 2, cancellation_lead_time: 0
      )
      workshop_invited_subject.update!(status: 'cancelled')

      frozen_time = workshop.start_time + 1.hour

      allow(Time).to receive(:current).and_return(frozen_time)

      post :book, params: {
        workshop_id: workshop.id,
        id: workshop_invite.id,
        workshop_subject_details: {
          preferred_language: 'en',
          neurodivergent: true,
          neurodivergent_comments: 'test'
        }
      }

      expect(response.status).to eq(400)
      expect(JSON.parse(response.body)['errors']).to eq(
        [I18n.t('administration.bookings.errors.cancelled_and_rebook_deadline_passed')]
      )
    end

    context 'book a seat' do
      it 'returns success' do
        workshop.update!(booked_seats: 1, total_seats: 2)

        post :book, params: {
          workshop_id: workshop.id,
          id: workshop_invite.id,
          workshop_subject_details: {
            preferred_language: 'en',
            neurodivergent: true,
            neurodivergent_comments: 'test'
          }
        }

        expect(response.status).to eq(200)
        expect(JSON.parse(response.body)).to eq('ok')
      end
    end
  end

  describe 'POST cancel_or_request_cancellation' do
    context 'cancel a seat' do
      it 'returns success' do
        workshop_subject
        workshop_invited_subject.update!(status: 'accepted')
        workshop.update!(cancellation_lead_time: 3600)

        post :cancel_or_request_cancellation, params: {
          workshop_id: workshop.id,
          id: workshop_invite.id,
          status: 'cancelled'
        }, as: :json

        expect(response.status).to eq(200)
        expect(JSON.parse(response.body)).to eq('ok')
        expect(workshop_invited_subject.reload.status).to eq('cancelled')
      end

      it 'returns error is passed cancellation deadline' do
        workshop_invited_subject.update!(status: 'accepted')
        create(:workshop_subject, workshop: workshop, user: user, campaign: workshop_invite.campaign)
        workshop.update!(cancellation_lead_time: 0)

        frozen_time = workshop.start_time + 1.hour

        allow(Time).to receive(:current).and_return(frozen_time)

        post :cancel_or_request_cancellation, params: {
          workshop_id: workshop.id,
          id: workshop_invite.id,
          status: 'cancelled'
        }

        expect(response.status).to eq(400)
        expect(JSON.parse(response.body)['errors']).to eq(
          [I18n.t('administration.bookings.errors.cancellation_deadline_passed')]
        )
      end
    end

    context 'request cancellation' do
      it 'returns success' do
        workshop_invited_subject.update!(status: 'accepted')
        create(:workshop_subject, workshop: workshop, user: user, campaign: workshop_invite.campaign)

        post :cancel_or_request_cancellation, params: {
          workshop_id: workshop.id,
          id: workshop_invite.id,
          status: 'requested_cancellation',
          reason: 'test'
        }

        expect(response.status).to eq(200)
        expect(JSON.parse(response.body)).to eq('ok')
        expect(workshop_invited_subject.reload.status).to eq('requested_cancellation')
        expect(workshop_invited_subject.reload.reason).to eq('test')
      end

      it 'allows request cancellation even if passed cancellation deadline' do
        workshop_invited_subject.update!(status: 'accepted')
        workshop_subject
        workshop.update!(cancellation_lead_time: 0)
        workshop_booked_seats = workshop.booked_seats

        frozen_time = workshop.start_time - workshop.cancellation_lead_time.hours + 1.hour

        allow(Time).to receive(:now).and_return(frozen_time)

        post :cancel_or_request_cancellation, params: {
          workshop_id: workshop.id,
          id: workshop_invite.id,
          status: 'requested_cancellation',
          reason: 'test'
        }

        expect(response.status).to eq(200)
        expect(JSON.parse(response.body)).to eq('ok')
        expect(workshop_invited_subject.reload.status).to eq('requested_cancellation')
        expect(workshop_invited_subject.reload.reason).to eq('test')
        expect(workshop_subject.reload.workshop_id).to eq(workshop.id)
        expect(workshop_subject.reload.user_id).to eq(user.id)
        expect(workshop.reload.booked_seats).to eq(workshop_booked_seats)
      end
    end
  end

  describe 'POST reschedule_or_request_reschedule' do
    context 'reschedule a seat' do
      it 'returns success' do
        workshop_invited_subject.update!(status: 'accepted')
        workshop.update!(reschedule_lead_time: 3600)
        create(:workshop_subject, workshop: workshop, user: user, campaign: workshop_invite.campaign)
        new_workshop = create(:workshop, start_time: workshop.start_time + 1.day)

        post :reschedule_or_request_reschedule, params: {
          workshop_id: workshop.id,
          id: workshop_invite.id,
          status: 'rescheduled',
          new_workshop_booking_id: new_workshop.id,
          workshop_subject_details: {
            preferred_language: 'en',
            neurodivergent: true,
            neurodivergent_comments: 'test'
          }
        }
        expect(response.status).to eq(200)
        expect(JSON.parse(response.body)).to eq('ok')
        expect(workshop_invited_subject.reload.status).to eq('rescheduled')
      end

      it 'returns error is passed reschedule deadline' do
        workshop_invited_subject.update!(status: 'accepted')
        create(:workshop_subject, workshop: workshop, user: user, campaign: workshop_invite.campaign)
        new_workshop = create(:workshop, start_time: workshop.start_time + 1.day)
        workshop.update!(reschedule_lead_time: 0)

        frozen_time = workshop.start_time + 1.hour

        allow(Time).to receive(:current).and_return(frozen_time)

        post :reschedule_or_request_reschedule, params: {
          workshop_id: workshop.id,
          id: workshop_invite.id,
          status: 'rescheduled',
          new_workshop_booking_id: new_workshop.id,
          workshop_subject_details: {
            preferred_language: 'en',
            neurodivergent: true,
            neurodivergent_comments: 'test'
          }
        }

        expect(response.status).to eq(400)
        expect(JSON.parse(response.body)['errors']).to eq(
          [I18n.t('administration.bookings.errors.reschedule_deadline_passed')]
        )
      end

      it 'allows requested_rescheduling even if passed reschedule deadline' do
        workshop_invited_subject.update!(status: 'accepted')
        workshop_subject = create(:workshop_subject, workshop: workshop, user: user, campaign: workshop_invite.campaign)
        new_workshop = create(:workshop, start_time: workshop.start_time + 1.day)
        workshop.update!(reschedule_lead_time: 0)
        workshop_booked_seats = workshop.booked_seats

        frozen_time = workshop.start_time - workshop.reschedule_lead_time.hours + 1.hour

        allow(Time).to receive(:current).and_return(frozen_time)

        post :reschedule_or_request_reschedule, params: {
          workshop_id: workshop.id,
          id: workshop_invite.id,
          new_workshop_booking_id: new_workshop.id,
          status: 'requested_rescheduling',
          reason: 'test',
          new_workshop_id: new_workshop.id
        }

        expect(response.status).to eq(200)
        expect(JSON.parse(response.body)).to eq('ok')
        expect(workshop_invited_subject.reload.status).to eq('requested_rescheduling')
        expect(workshop_invited_subject.reload.reason).to eq('test')
        expect(workshop_subject.reload.workshop_id).to eq(workshop.id)
        expect(workshop_subject.reload.user_id).to eq(user.id)
        expect(workshop.reload.booked_seats).to eq(workshop_booked_seats)
      end
    end
  end
end
