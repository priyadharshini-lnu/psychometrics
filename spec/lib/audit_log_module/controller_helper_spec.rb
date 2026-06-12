# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AuditLogModule::ControllerHelper, type: :controller do
  controller(ActionController::Base) do
    include AuditLogModule::ControllerHelper

    def index
      audit!(:test_action, current_user)
      render plain: 'OK'
    end

    attr_reader :current_user
  end

  let(:user) { create(:superadmin) }
  let(:impersonator) { create(:superadmin) }

  before do
    controller.instance_variable_set(:@current_user, user)
    routes.draw { get 'index' => 'anonymous#index' }
  end

  describe '#audit!' do
    it 'auto-populates impersonated_by_id from session' do
      session[:impersonated_by_id] = impersonator.id
      get :index

      log = AuditLog.last
      expect(log.impersonated_by_id).to eq(impersonator.id)
      expect(log.user_id).to eq(user.id)
    end

    it 'leaves impersonated_by_id nil when session has no impersonation' do
      get :index

      log = AuditLog.last
      expect(log.impersonated_by_id).to be_nil
    end

    it 'does not override explicitly passed impersonated_by_id' do
      session[:impersonated_by_id] = impersonator.id
      other_user = create(:superadmin)

      controller.instance_variable_set(:@current_user, user)
      controller.send(:audit!, :test_explicit, user, impersonated_by_id: other_user.id)

      log = AuditLog.find_by(action: 'test_explicit')
      expect(log.impersonated_by_id).to eq(other_user.id)
    end
  end
end
