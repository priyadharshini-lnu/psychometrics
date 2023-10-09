# frozen_string_literal: true

require 'rails_helper'

describe EndUser::UsersController, type: :controller do
  let(:current_password) { 'Current@Password129' }
  let(:user) { create(:user, :with_project_membership, password: current_password) }

  before(:each) do
    login_user(user)
  end

  describe 'POST /users/change_locale' do
    xit 'change locale' do
      post :change_locale, params: {
        format: :json,
        locale: 'ar'
      }
      expect(response).to have_http_status(:success)
      expect(I18n.locale).to eq(:ar)
    end
  end

  describe 'PATCH /users/update_details' do
    it 'updates user' do
      patch :update_details, params: {
        format: :json,
        user: { id: user.id, first_name: 'Elliot', last_name: 'Alderson' }
      }
      parsed_result = JSON.parse(response.body)
      expect(response).to have_http_status(:success)

      expected_array = %w[id email first_name last_name full_name
                          is_anonym photo timezone role
                          custom_fields age gender locale last_sign_in_at profile_completion_percentage updated_at
                          update_profile_required update_profile_message back_url]
      expect(parsed_result.keys).to match_array(expected_array)
      expect(parsed_result['id']).to eq(user.id)
      expect(parsed_result['first_name']).to eq('Elliot')
      expect(parsed_result['last_name']).to eq('Alderson')
    end

    it 'returns bad request 400 status if user details doesnt update' do
      patch :update_details, params: {
        format: :json,
        user: { id: user.id, first_name: 'Elliot' }
      }
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe 'PATCH /users/update_details' do
    let(:new_password) { 'NewPassword@129' }

    it 'returns current password is incorrect error' do
      patch :change_password, params: {
        format: :json,
        current_password: 'wrong_password', password: new_password, password_confirmation: new_password
      }

      parsed_result = JSON.parse(response.body)

      expect(response.status).to eq(422)
      expect(parsed_result.dig('errors', 'current_password')).to include('Current password is incorrect')
    end

    it "returns password can't be blank error" do
      patch :change_password, params: {
        format: :json,
        current_password: current_password, password: '', password_confirmation: new_password
      }

      parsed_result = JSON.parse(response.body)

      expect(response.status).to eq(422)
      expect(parsed_result.dig('errors', 'password')).to include("can't be blank")
    end

    it 'returns password confirmation not matching error' do
      patch :change_password, params: {
        format: :json,
        current_password: current_password, password: new_password, password_confirmation: 'non_matching'
      }

      parsed_result = JSON.parse(response.body)

      expect(response.status).to eq(422)
      expect(parsed_result.dig('errors', 'password_confirmation')).to include("doesn't match Password")
    end

    it 'returns current password same as current password error' do
      patch :change_password, params: {
        format: :json,
        current_password: current_password, password: current_password, password_confirmation: current_password
      }

      parsed_result = JSON.parse(response.body)

      expect(response.status).to eq(422)
      expect(parsed_result.dig('errors', 'password')).to include('must be different than the current password.')
    end

    it "returns current password can't be same as previously used password error" do
      allow_any_instance_of(SecuritySetting).to receive(:disable_password_reuse).and_return(true)
      old_password = current_password
      user.update!(password: new_password)
      current_password = new_password
      login_user(user)
      patch :change_password, params: {
        format: :json,
        current_password: current_password, password: old_password, password_confirmation: old_password
      }

      parsed_result = JSON.parse(response.body)

      expect(response.status).to eq(422)
      expect(parsed_result.dig('errors', 'password')).to include('must not be same as any previously used password.')
    end

    it 'returns password length error' do
      allow_any_instance_of(SecuritySetting).to receive(:min_password_length).and_return(20)
      patch :change_password, params: {
        format: :json,
        current_password: current_password, password: new_password, password_confirmation: new_password
      }

      parsed_result = JSON.parse(response.body)

      expect(response.status).to eq(422)
      expect(parsed_result.dig('errors', 'password')).to include('is too short (minimum is 20 characters)')
    end

    it 'returns error if password have characters repeat' do
      allow_any_instance_of(SecuritySetting).to receive(:restrict_sequences).and_return(true)
      patch :change_password, params: {
        format: :json,
        current_password: current_password, password: 'aaaaaaa111111', password_confirmation: 'aaaaaaa111111'
      }

      parsed_result = JSON.parse(response.body)

      expect(response.status).to eq(422)
      expect(parsed_result.dig('errors', 'password')).to include('Password must not contain repeats')
    end

    it "returns error if password doesn't contain any digit" do
      allow_any_instance_of(SecuritySetting).to receive(:enforce_strong_password?).and_return(true)
      patch :change_password, params: {
        format: :json,
        current_password: current_password, password: 'Without_digit', password_confirmation: 'Without_digit'
      }

      parsed_result = JSON.parse(response.body)

      expect(response.status).to eq(422)
      expect(parsed_result.dig('errors', 'password')).to include('must contain at least one digit')
    end

    it "returns error if password doesn't contain any special character" do
      allow_any_instance_of(SecuritySetting).to receive(:enforce_strong_password?).and_return(true)
      patch :change_password, params: {
        format: :json,
        current_password: current_password,
        password: 'WithoutSpecialChar1',
        password_confirmation: 'WithoutSpecialChar1'
      }

      parsed_result = JSON.parse(response.body)

      expect(response.status).to eq(422)
      expect(parsed_result.dig('errors', 'password')).to include('must contain at least one punctuation mark or symbol')
    end

    it "returns error if error if password doesn't contain any upper" do
      allow_any_instance_of(SecuritySetting).to receive(:enforce_strong_password?).and_return(true)
      patch :change_password, params: {
        format: :json,
        current_password: current_password,
        password: 'without_upper_case1',
        password_confirmation: 'without_upper_case1'
      }

      parsed_result = JSON.parse(response.body)

      expect(response.status).to eq(422)
      expect(parsed_result.dig('errors', 'password')).to include('must contain at least one upper-case letter')
    end

    it 'changes password if valid params are provide' do
      patch :change_password, params: {
        format: :json,
        current_password: current_password, password: new_password, password_confirmation: new_password
      }

      expect(user.reload.valid_password?(new_password)).to eq(true)
      expect(response.status).to eq(200)
    end
  end
end
