require 'rails_helper'
include Features::Helpers::Users

feature 'CRUD User' do
  given(:superadmin) { create(:superadmin) }
  given(:project) { create(:project) }
  given(:project2) { create(:project, parent: project.tte) }

  context 'As SuperAdmin' do
    before { login_as superadmin }

    context 'on Users page' do
      scenario 'I can create superadmin' do
        create_superadmin(email: 'superadmin@example.com', first_name: 'super', last_name: 'admin')
      end
    end

    context 'on Projects page' do
      scenario 'I can create or choose admin user' do
        admin_membership = create_admin(project, email: 'admin@example.com', first_name: 'admin', last_name: 'user')
        choose_admin(project2, admin_membership)
      end

      context 'another Client Admin' do
        given(:admin) { create(:admin) }

        scenario 'I cant assign client admin from another tenancy' do
          create_admin(project, email: admin.email, first_name: 'Bob', last_name: 'Duke') do
            expect(page).to have_css('form#new_resource .alert-danger')
            expect(page).to have_content(t('activerecord.errors.messages.admin_for_another_tte'))
          end
        end
      end
    end
  end

  context 'As Client Admin' do
    given(:admin) { create(:admin, memberships_options: [{ client: project }, { client: project2 }]) }
    before { login_as admin }

    context 'on Projects page' do
      scenario 'I can create or choose admin user' do
        admin_membership = create_admin(project, email: 'admin@example.com', first_name: 'admin', last_name: 'user')
        choose_admin(project2, admin_membership)
      end
    end
  end
end
