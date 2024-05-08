# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::UserIdpPlansController, type: :controller do
  let(:current_password) { 'Current@Password129' }
  let!(:user) { create(:user, :with_project_membership, password: current_password) }
  let(:campaign) { create(:campaign) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, campaign: campaign) }
  let(:behavioral_skill) { create(:skill, category: :behavioral) }
  let(:technical_skill) { create(:skill, category: :technical) }
  let(:other_skill) { create(:skill, category: :other) }
  let(:structured_learning) { create(:development_action, learning_style: :structured_learning) }
  let(:learning_from_others) { create(:development_action, learning_style: :learning_from_others) }
  let(:on_the_job) { create(:development_action, learning_style: :on_the_job) }

  let!(:development_actions) do
    [
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: behavioral_skill,
development_action: structured_learning, progress: 30),

      create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: technical_skill,
development_action: learning_from_others, progress: 70),
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: technical_skill,
development_action: on_the_job, progress: 0),
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: other_skill,
development_action: on_the_job, progress: 90)
    ]
  end

  before(:each) { login_user(user) }
  after(:each) { sign_out(user) }

  describe 'GET summary' do
    it 'get user idp plan summary' do
      get :summary, params: { user_id: user.id }
      parsed_result = JSON.parse(response.body)

      expect(parsed_result).to eq({
        'skills_by_category_count' => { 'behavioral' => 1, 'technical' => 2, 'other' => 1 },
        'development_actions_by_learning_style_count' => { 'structured_learning' => 1, 'learning_from_others' => 1,
                                                           'on_the_job' => 2 },
        'skill_progress_by_category' => { 'behavioral' => 30.0, 'technical' => 35.0,
                                          'other' => 90.0 }
      })
    end
  end
end
