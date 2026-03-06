# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::AssessmentAssistantsController, type: :controller do
  let(:super_admin) { create(:superadmin) }
  let(:assessment) { create(:assessment) }
  let(:assistant) { create(:assistant, assistant_type: 'content_writer') } # TODO: change type

  before do
    sign_in super_admin
    request.headers['Content-Type'] = 'application/vnd.api+json'
  end

  describe 'GET #show' do
    it 'returns success status' do
      get :show, params: { id: assessment.id }
      expect(response).to have_http_status(:ok)
    end

    it 'returns the assessment assistant attributes' do
      create(:assessment_assistant, assessment: assessment, ai_assistant: assistant, assessment_prompt: 'Test prompt')
      get :show, params: { id: assessment.id }
      expect(response).to have_http_status(200)

      json_response = JSON.parse(response.body) # rubocop:disable Rails/ResponseParsedBody

      expect(json_response['data']['attributes']['assessment_id']).to eq(assessment.id.to_s)
      expect(json_response['data']['attributes']['ai_assistant_id']).to eq(assistant.id.to_s)
      expect(json_response['data']['attributes']['assessment_prompt']).to eq('Test prompt')
    end
  end

  describe 'PATCH #update' do
    let(:json_payload) do
      {
        data: {
          type: 'assessment_assistants',
          id: assessment.id.to_s,
          attributes: {
            ai_assistant_id: assistant.id,
            assessment_prompt: 'Updated prompt'
          }
        }
      }.to_json
    end

    it 'updates the assessment assistant' do
      patch :update, params: JSON.parse(json_payload).merge(id: assessment.id)

      expect(response).to have_http_status(:ok)
      assessment_assistant = AssessmentAssistant.find_by(assessment_id: assessment.id)
      expect(assessment_assistant.assessment_prompt).to eq('Updated prompt')
      expect(assessment_assistant.ai_assistant_id).to eq(assistant.id)
    end
  end
end
