# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Administration::FactorsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let!(:project) { create(:project) }
  let(:dimension) { create(:dimension, :with_multiple_occupations) }
  let(:factor) { create(:factor, dimension: dimension) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'DELETE #destroy' do
    it 'destroys the requested factor' do
      expect(delete :destroy, params: { id: factor.id, dimension_id: dimension.id }).to change(Factor, :count).by(-1)
    end

    it 'includes factor name in flash message after deletion' do
      request.env['HTTP_REFERER'] = '/previous_page'
      factor_name = factor.decorate.display_name

      delete :destroy, params: { id: factor.id, dimension_id: dimension.id }

      expect(flash[:success]).to include(factor_name)
    end
  end
end
