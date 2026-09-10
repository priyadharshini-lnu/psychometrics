# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessors::ParticipantsController, type: :controller do
  let(:current_user) { create(:user, :assessor) }
  let(:assessors_campaign) { current_user.assessors.first.campaign }
  let(:subject_user) { create(:user) }
  let!(:user_assessment) do
    create(
      :user_assessment,
      evaluator: current_user,
      campaign: assessors_campaign,
      subject: subject_user,
      relationship: Relationship.assessor_relationship,
      assessment: create(:assessment, category: :assessor_form)
    )
  end

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'GET #index' do
    it 'returns 200' do
      get :index
      expect(response).to have_http_status(:ok)
    end

    it 'returns list and total keys' do
      get :index
      parsed = response.parsed_body
      expect(parsed).to have_key('list')
      expect(parsed).to have_key('total')
    end

    it 'returns expected fields per participant' do
      get :index
      participant = response.parsed_body['list'].first

      expect(participant).to include(
        'id' => subject_user.id,
        'campaign_id' => assessors_campaign.id,
        'campaign_name' => assessors_campaign.name,
        'evaluation_status' => 'not_started'
      )
      expect(participant.keys).to include(
        'project_name', 'candidate_name', 'candidate_email',
        'evaluation_completed', 'evaluation_total', 'moderation_status'
      )
    end

    it 'does not return participants from campaigns the assessor is not assigned to' do
      other_user = create(:user)
      other_campaign = create(:campaign)
      # other_user has an assessment in other_campaign but current_user is NOT the evaluator
      create(:user_assessment, subject: other_user, campaign: other_campaign)

      get :index
      subject_ids = response.parsed_body['list'].pluck('id')
      expect(subject_ids).not_to include(other_user.id)
    end

    it 'returns individual moderation statuses for each candidate' do
      second_subject = create(:user)

      # First subject gets a COMPLETED moderation
      create(:user_assessment,
             evaluator: current_user,
             campaign: assessors_campaign,
             subject: subject_user,
             relationship: Relationship.assessor_relationship,
             assessment: create(:assessment, category: :lead_assessor_form),
             status: :completed)

      # Second subject gets a regular assessor form (no moderation yet)
      create(:user_assessment,
             evaluator: current_user,
             campaign: assessors_campaign,
             subject: second_subject,
             relationship: Relationship.assessor_relationship,
             assessment: create(:assessment, category: :assessor_form))

      get :index

      list = response.parsed_body['list']
      p1 = list.find { |p| p['id'] == subject_user.id }
      p2 = list.find { |p| p['id'] == second_subject.id }

      expect(p1['moderation_status']).to eq('completed')
      # second_subject has no lead_assessor_form assessment, so counts total is 0,
      expect(p2['moderation_status']).to eq('completed')
    end
  end
end
