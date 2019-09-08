# frozen_string_literal: true

module ControllerMacros
  def login_user
    before(:each) do
      @request.env['devise.mapping'] = Devise.mappings[:user]
      sign_in FactoryGirl.create(:user)
    end
  end

  def login_superadmin
    let(:controller_superadmin) { FactoryGirl.create(:superadmin) }
    before(:each) do
      @request.env['devise.mapping'] = Devise.mappings[:administration]
      sign_in controller_superadmin
    end
    after(:each) do
      @request.env.delete('devise.mapping')
      sign_out controller_superadmin
    end
  end

  def login_client_admin
    before(:each) do
      @request.env['devise.mapping'] = Devise.mappings[:administration]
      sign_in FactoryGirl.create(:client_admin)
    end
  end
end
