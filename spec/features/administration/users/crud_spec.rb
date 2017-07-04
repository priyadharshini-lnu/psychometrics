require 'rails_helper'
include Features::Helpers::Users

feature 'CRUD User' do
  given(:superadmin) { create(:superadmin) }
  given!(:project) { create(:project) }
  given!(:project2) { create(:project, parent: project.tte) }

  context 'As SuperAdmin user' do
    before { login_as superadmin }

    context 'on Clients Page' do
      scenario 'I can create or choose admin user' do
        admin_membership = create_admin(project, email: 'admin@example.com', first_name: 'admin', last_name: 'user')
        admin_membership2 = choose_admin(project2, admin_membership.decorate.display_name)
        expect(admin_membership.user).to eql(admin_membership2.user)
      end
    end
  end
end
