require 'rails_helper'
include Features::Helpers::Users

feature 'CRUD User' do
  given(:superadmin) { create(:superadmin) }
  given(:project_end_level) { create(:project_end_level) }
  given(:sub_campaign) { create(:sub_campaign) }

  context 'As SuperAdmin user' do
    before { login_as superadmin }

    context 'on Clients Page' do
      scenario 'I can create or choose admin user' do
        create_admin(project_end_level, email: 'admin@example.com', first_name: 'admin', last_name: 'user')
      end
    end
  end
end
