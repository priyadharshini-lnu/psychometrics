# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::ProfilesController, type: :controller do
  let(:current_password) { 'Password@129' }
  let(:new_password) { 'New_Password@1299' }
  let(:client_admin) { create(:client_admin, password: current_password) }
  let(:valid_params) { client_admin.slice(:email, :first_name, :last_name) }

  before(:each) { login_user(client_admin) }
  after(:each) { sign_out(client_admin) }

  describe 'PATCH update' do
    it 'renders errors if current password not correct' do
      patch :update, params: {
        id: client_admin.id,
        user: valid_params.merge(
          change_password: true,
          current_password: 'Some_Random_Password1',
          password: new_password,
          password_confirmation: new_password
        )
      }

      expect(response.body).to have_selector('.user_current_password .text-danger',
                                             text: 'Current password is incorrect')
    end

    it "renders password can't be blank error" do
      patch :update, params: {
        id: client_admin.id,
        user: valid_params.merge(
          change_password: true,
          current_password: new_password,
          password: '',
          password_confirmation: ''
        )
      }

      expect(response.body).to have_selector('.user_password .text-danger', text: "can't be blank")
    end

    it 'renders password confirmation failing eror' do
      patch :update, params: {
        id: client_admin.id,
        user: valid_params.merge(
          change_password: true,
          current_password: current_password,
          password: new_password,
          password_confirmation: 'Non_Matching_Password1'
        )
      }

      expect(response.body).to have_selector('.user_password_confirmation .text-danger', text: "doesn't match Password")
    end

    it 'renders current password same as old password error' do
      patch :update, params: {
        id: client_admin.id,
        user: valid_params.merge(
          change_password: true,
          current_password: current_password,
          password: current_password,
          password_confirmation: current_password
        )
      }

      expect(response.body).to have_selector('.user_password .text-danger',
                                             text: 'must be different than the current password.')
    end

    it "renders current password can't be same as previously used password error" do
      old_password = current_password
      client_admin.update!(password: new_password)
      current_password = new_password
      login_user(client_admin)

      patch :update, params: {
        id: client_admin.id,
        user: valid_params.merge(
          change_password: true,
          current_password: current_password,
          password: old_password,
          password_confirmation: old_password
        )
      }

      expect(response.body).to have_selector('.user_password .text-danger',
                                             text: 'must not be same as any previously used password.')
    end

    it 'renders password length error if length is less than 12' do
      patch :update, params: {
        id: client_admin.id,
        user: valid_params.merge(
          change_password: true,
          current_password: current_password,
          password: 'Bellow@12',
          password_confirmation: 'Bellow@12'
        )
      }

      expect(response.body).to have_selector('.user_password .text-danger',
                                             text: 'is too short (minimum is 12 characters)')
    end

    it 'renders error if password character repeats' do
      patch :update, params: {
        id: client_admin.id,
        user: valid_params.merge(
          change_password: true,
          current_password: current_password,
          password: 'Aaaaa@111111',
          password_confirmation: 'Aaaaa@111111'
        )
      }

      expect(response.body).to have_selector('.user_password .text-danger',
                                             text: 'Password must not contain repeats')
    end

    it "renders error if password doesn't contain any digit" do
      patch :update, params: {
        id: client_admin.id,
        user: valid_params.merge(
          change_password: true,
          current_password: current_password,
          password: 'Without_digit',
          password_confirmation: 'Without_digit'
        )
      }

      expect(response.body).to have_selector('.user_password .text-danger', text: 'must contain at least one digit')
    end

    it "renders error if password doesn't contain any special character" do
      patch :update, params: {
        id: client_admin.id,
        user: valid_params.merge(
          change_password: true,
          current_password: current_password,
          password: 'WithoutSpecialChar1',
          password_confirmation: 'WithoutSpecialChar1'
        )
      }

      expect(response.body).to have_selector('.user_password .text-danger',
                                             text: 'must contain at least one punctuation mark or symbol')
    end

    it "renders error if password doesn't contain any upper" do
      patch :update, params: {
        id: client_admin.id,
        user: valid_params.merge(
          change_password: true,
          current_password: current_password,
          password: 'without_upper_case1',
          password_confirmation: 'without_upper_case1'
        )
      }

      expect(response.body).to have_selector('.user_password .text-danger',
                                             text: 'must contain at least one upper-case letter')
    end

    it "doesn't apply any password validation if we are not changing password" do
      first_name = 'NewName'
      patch :update, params: {
        id: client_admin.id,
        user: valid_params.merge(change_password: false, first_name: first_name)
      }

      expect(client_admin.reload.first_name).to eq(first_name)
      expect(flash[:notice]).to eq('Profile was updated successfully.')
    end

    it 'logs out after password changed successfully' do
      patch :update, params: {
        id: client_admin.id,
        user: valid_params.merge(
          change_password: true,
          current_password: current_password,
          password: new_password,
          password_confirmation: new_password
        )
      }

      expect(response).to redirect_to(root_path)
      expect(client_admin.reload.valid_password?(new_password)).to eq(true)
    end
  end
end
