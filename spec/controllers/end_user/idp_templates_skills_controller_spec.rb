# frozen_string_literal: true

require 'rails_helper'

describe EndUser::IdpTemplateSkillsController, type: :controller do
  let(:current_password) { 'Current@Password129' }
  let!(:user) { create(:user, :with_project_membership, password: current_password) }

  let!(:skill) { create(:skill, name: 'abc') }
  let!(:idp_template) { create(:idp_template) }
  let!(:idp_template_skill) { create(:idp_template_skill, idp_template: idp_template, skill: skill) }
  let!(:user_idp_plan) { create(:user_idp_plan, user: user, idp_template: idp_template) }

  before(:each) do
    login_user(user)
  end

  describe 'GET index' do
    it 'returns idp_template_skills' do
      get :index

      parsed_response = JSON.parse(response.body)

      expect(response.status).to eq(200)
      expect(parsed_response.count).to eq(1)
      expect(parsed_response[0]['id']).to eq(idp_template_skill.id)
      expect(parsed_response[0]['name']).to eq(skill.name)
    end
  end
end
