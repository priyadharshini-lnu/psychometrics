# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessors::UsersController, type: :controller do
  let(:current_user) { create(:user, :assessor) }
  let(:assessors_campaign) { current_user.assessors.first.campaign }
  let!(:assessors_user) { create(:user_assessment, evaluator: current_user, campaign: assessors_campaign).subject }
  let!(:non_assssor_campaign) { create(:campaign) }
  let!(:non_assssor_user) { create(:user_assessment, evaluator: current_user, campaign: non_assssor_campaign).subject }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'index' do
    it 'returns users which assessor have access to' do
      get :index, params: { campaign_id: assessors_campaign.id }

      parsed_response = JSON.parse(response.body)
      expect(parsed_response['total']).to eq(1)
      expect(parsed_response['list']).to eq([{
        'id' => assessors_user.id,
        'full_name' => assessors_user.decorate.full_name,
        'email' => assessors_user.email
      }])
    end
  end
end
