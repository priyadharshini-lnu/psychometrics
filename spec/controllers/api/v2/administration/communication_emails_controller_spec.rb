# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::CommunicationEmailsController, type: :controller do
  # NOTE: CommunicationEmail#redeliver! (after_commit on: :create) enqueues the real mailer job.
  # Stubbed here to isolate the controller/resource behaviour under test from that side effect.
  before { allow_any_instance_of(CommunicationEmail).to receive(:redeliver!) }

  let(:superadmin) { create(:superadmin) }

  before do
    allow(Settings.features).to receive(:communication_center_enabled).and_return(true)
    sign_in superadmin
    request.headers['Content-Type'] = 'application/vnd.api+json'
  end

  let(:delivery) do
    create(:communication_delivery, subject: 'Delivery subject', body: '<p>Delivery body</p>').tap do |d|
      d.client.client_feature.update!(use_new_communication_center: true)
    end
  end
  let(:other_delivery) { create(:communication_delivery, subject: 'Other subject', body: '<p>Other body</p>') }

  def email_for(a_delivery)
    user = create(:user, :with_project_membership)
    campaign_user = create(:campaign_user, user: user, campaign: a_delivery.campaign)
    create(:communication_email, communication: nil, communication_delivery: a_delivery,
                                  user: user, campaign_user: campaign_user)
  end

  describe 'GET #index' do
    let!(:email) { email_for(delivery) }
    let!(:other_email) { email_for(other_delivery) }

    it 'returns only emails for the given delivery when filtered' do
      get :index, params: { filter: { communication_delivery_id_eq: delivery.id } }

      expect(response).to have_http_status(:ok)
      ids = parsed_response['data'].map { |d| d['id'].to_i }
      expect(ids).to eq([email.id])
      expect(ids).not_to include(other_email.id)
    end
  end

  describe 'GET #preview' do
    let!(:email) { email_for(delivery) }

    it 'returns the rendered subject and body for a delivery-sourced email' do
      get :preview, params: { id: email.id }

      expect(response).to have_http_status(:ok)
      expect(parsed_response['subject']).to eq('Delivery subject')
      expect(parsed_response['body']).to include('Delivery body')
    end

    it 'renders the requested locale when given' do
      Mobility.with_locale(:fr) { delivery.update!(subject: 'Sujet FR', body: '<p>Corps FR</p>') }

      get :preview, params: { id: email.id, query: { locale: 'fr' } }

      expect(response).to have_http_status(:ok)
      expect(parsed_response['subject']).to eq('Sujet FR')
      expect(parsed_response['body']).to include('Corps FR')
    end
  end

  describe 'POST #retrigger' do
    let!(:email) { email_for(delivery) }

    context 'when the email is failed' do
      before { email.update!(status: :failed, error_code: 'Net::SMTPFatalError', error_message: 'boom') }

      it 'clears the error and redelivers the email' do
        post :retrigger, params: { id: email.id }

        expect(response).to have_http_status(:ok)
        expect(email.reload.error_code).to be_nil
        expect(email.reload.error_message).to be_nil
      end
    end

    context 'when the email is not failed' do
      it 'returns 422 and leaves the email unchanged' do
        post :retrigger, params: { id: email.id }

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe 'POST #create' do
    it 'has no route (create is locked down)' do
      expect do
        post :create, params: { data: { type: 'communication_emails', attributes: {} } }
      end.to raise_error(ActionController::UrlGenerationError)
    end
  end

  describe 'PATCH #update' do
    let!(:email) { email_for(delivery) }

    it 'has no route (update is locked down)' do
      expect do
        patch :update, params: { id: email.id, data: { type: 'communication_emails', id: email.id.to_s,
                                                       attributes: {} } }
      end.to raise_error(ActionController::UrlGenerationError)
    end
  end

  private

  def parsed_response
    JSON.parse(response.body) # rubocop:disable Rails/ResponseParsedBody
  end
end
