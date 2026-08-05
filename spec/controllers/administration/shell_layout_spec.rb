# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'the administration layout', type: :controller do
  render_views

  describe Administration::AppController do
    before { login_user(create(:superadmin)) }

    it 'renders no flash container on a shell page' do
      get :dashboard

      expect(response.body).not_to include('flash-messages')
    end

    it 'fails loudly when a shell page writes a flash nobody will render' do
      get :dashboard
      controller.flash[:alert] = 'nobody will see me'

      expect { controller.send(:detect_unrendered_flash) }.
        to raise_error(/never rendered: alert/)
    end
  end

  describe Administration::Administrator::ClientSelectionController do
    let(:user) { create(:client_admin, client: create(:tenancy)) }

    before do
      create(:membership, user: user, client: create(:tenancy), role: 'client_admin')
      sign_in user
    end

    it 'still renders the flash container on a Rails-rendered page' do
      get :index

      expect(response.body).to include('flash-messages')
    end
  end
end
