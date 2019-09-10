# frozen_string_literal: true

require 'rails_helper'

# describe BaseController, :type => :controller do
#   controller do
#     def index
#       raise ActionController::InvalidAuthenticityToken
#     end
#   end
#   context 'As user' do
#     let(:current_user)  { create(:user) }
#     before(:each) { sign_in(current_user) }
#     after(:each) { sign_out(current_user) }
#     it 'should redirect back if token is invalid' do
#       get :index
#       expect(response).to redirect_to(root_path)
#       expect(flash[:notice]).to eq(t('errors.try_again'))
#     end
#   end
# end
