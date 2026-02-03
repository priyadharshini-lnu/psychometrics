# frozen_string_literal: true

require 'rails_helper'

describe BaseController, type: :controller do
  controller do
    def index
      raise ActionController::InvalidAuthenticityToken
    end
  end

  context 'As user' do
    let(:current_user) { create(:superadmin) }

    before do
      allow(controller).to receive(:set_client_by_subdomain).and_return(true)
      allow(controller).to receive(:authenticate_user!).and_return(true)
      sign_in(current_user)
      allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(false)
    end

    it 'logs SessionManagementExceptions and redirects when token is invalid' do
      expect(SiemLogger).to receive(:log_security_event!).with(
        'SessionManagementExceptions',
        hash_including(
          context: "Session verification failed for #{current_user.email}",
          msg: 'SessionManagementException: ActionController::InvalidAuthenticityToken',
          actor_name: current_user.email,
          request_details: hash_including(
            exception_class: 'ActionController::InvalidAuthenticityToken'
          )
        )
      )

      request.env['HTTP_REFERER'] = 'http://test.host/previous'

      get :index

      expect(response).to be_redirect
    end
  end
end
