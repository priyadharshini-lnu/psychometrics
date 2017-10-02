module ControllerMacros
  def login_user
    before(:each) do
      @request.env['devise.mapping'] = Devise.mappings[:user]
      sign_in FactoryGirl.create(:user)
    end
  end

  def login_superadmin
    before(:each) do
      @request.env['devise.mapping'] = Devise.mappings[:administration]
      sign_in FactoryGirl.create(:superadmin)
    end
  end

  def login_client_admin
    before(:each) do
      @request.env['devise.mapping'] = Devise.mappings[:administration]
      sign_in FactoryGirl.create(:client_admin)
    end
  end
end
