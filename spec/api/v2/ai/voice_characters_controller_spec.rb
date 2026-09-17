# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::AI::VoiceCharactersController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:voice_character) { create(:voice_character) }
  let(:headers) { { 'Content-Type' => 'application/vnd.api+json' } }

  before { sign_in(superadmin) }

  after { sign_out(superadmin) }

  describe 'GET #index' do
    it 'returns the voice characters' do
      get '/api/v2/administration/ai/voice_characters', headers: headers

      expect(response).to have_http_status(200)
      data = JSON.parse(response.body)['data']
      expect(data).to be_an(Array)
      expect(data.first['type']).to eq('voice_characters')
      expect(data.first['attributes']).to have_key('external_voice_id')
    end
  end

  describe 'POST #create' do
    let!(:tenant) { create(:tenancy) }
    let(:params) do
      {
        data: {
          type: 'voice_characters',
          attributes: {
            name: 'Probing Voice',
            external_voice_id: 'en-US-JennyNeural',
            locale: 'en-US',
            style: 'empathetic'
          },
          relationships: {
            tenant: { data: { type: 'clients', id: tenant.id.to_s } }
          }
        }
      }
    end

    it 'creates a voice character scoped to a tenant' do
      post '/api/v2/administration/ai/voice_characters', params: params.to_json, headers: headers

      expect(response).to have_http_status(201)
      attributes = JSON.parse(response.body)['data']['attributes']
      expect(attributes['name']).to eq('Probing Voice')
      expect(attributes['external_voice_id']).to eq('en-US-JennyNeural')
      expect(AI::VoiceCharacter.last.tenant_id).to eq(tenant.id)
    end

    it 'creates a platform-level voice character with a null tenant' do
      params[:data][:relationships] = { tenant: { data: nil } }

      post '/api/v2/administration/ai/voice_characters', params: params.to_json, headers: headers

      expect(response).to have_http_status(201)
      expect(AI::VoiceCharacter.last.tenant_id).to be_nil
    end
  end

  describe 'PATCH #update' do
    let(:params) do
      {
        data: {
          id: voice_character.id.to_s,
          type: 'voice_characters',
          attributes: { style: 'cheerful' }
        }
      }
    end

    it 'updates the voice character' do
      patch "/api/v2/administration/ai/voice_characters/#{voice_character.id}",
            params: params.to_json, headers: headers

      expect(response).to have_http_status(200)
      expect(voice_character.reload.style).to eq('cheerful')
    end
  end

  describe 'DELETE #destroy' do
    it 'deletes the voice character' do
      delete "/api/v2/administration/ai/voice_characters/#{voice_character.id}", headers: headers

      expect(response).to have_http_status(204)
    end
  end

  describe 'POST #preview' do
    let(:preview_params) do
      { data: { attributes: { external_voice_id: 'en-US-JennyNeural', text: 'Tell me more' } } }
    end

    context 'when synthesis succeeds' do
      before do
        allow(AI::TTS::SynthesizeSpeech).to receive(:call).and_return(
          { ok: { content: 'audio-bytes', content_type: 'audio/mpeg' } }
        )
      end

      it 'returns a base64 audio data url' do
        post '/api/v2/administration/ai/voice_characters/preview',
             params: preview_params.to_json, headers: headers

        expect(response).to have_http_status(200)
        audio = JSON.parse(response.body).dig('attributes', 'audio')
        expect(audio).to start_with('data:audio/mpeg;base64,')
      end
    end

    context 'when synthesis fails' do
      before do
        allow(AI::TTS::SynthesizeSpeech).to receive(:call).and_return({ error: 'Azure TTS failed' })
      end

      it 'returns an unprocessable entity error' do
        post '/api/v2/administration/ai/voice_characters/preview',
             params: preview_params.to_json, headers: headers

        expect(response).to have_http_status(422)
      end
    end

    context 'when no voice is supplied' do
      it 'returns an unprocessable entity error' do
        post '/api/v2/administration/ai/voice_characters/preview',
             params: { data: { attributes: { text: 'Tell me more' } } }.to_json, headers: headers

        expect(response).to have_http_status(422)
      end
    end
  end

  describe 'GET #voices' do
    let(:voices) do
      [{ external_voice_id: 'en-US-JennyNeural', display_name: 'Jenny', locale: 'en-US',
         locale_name: 'English (United States)', gender: 'Female', styles: %w[cheerful empathetic] }]
    end

    before do
      allow(AI::TTS::ListVoices).to receive(:call).and_return({ ok: voices })
    end

    it 'returns the cached voice catalogue' do
      get '/api/v2/administration/ai/voice_characters/voices', headers: headers

      expect(response).to have_http_status(200)
      data = JSON.parse(response.body).dig('attributes', 'voices')
      expect(data.first['external_voice_id']).to eq('en-US-JennyNeural')
      expect(data.first['styles']).to eq(%w[cheerful empathetic])
    end
  end
end
