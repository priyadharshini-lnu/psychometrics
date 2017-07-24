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
        follow_superadmin_invitation
      end
    end

    context 'on Projects page' do
      scenario 'I can create client admin' do
        create_admin(project, email: 'admin@example.com', first_name: 'admin', last_name: 'user')
        follow_admin_invitation
      end

      context 'with existing client admin' do
        given(:admin_membership) { create(:admin_membership, client: project) }

        scenario 'I can choose client admin' do
          choose_admin(project2, admin_membership)
        end
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

    context 'on Project Users page' do
      given(:sub_campaign) { create(:sub_campaign) }

      scenario 'I can create user' do
        create_user(sub_campaign, email: 'user@example.com', first_name: 'Bob', last_name: 'Duke')
        follow_user_invitation
      end
    end
  end

  context 'As Client Admin' do
    before { login_as admin }

    context 'on Projects page' do
      given(:admin) { create(:admin, memberships_options: [{ client: project }, { client: project2 }]) }

      scenario 'I can create or choose admin user' do
        admin_membership = create_admin(project, email: 'admin@example.com', first_name: 'admin', last_name: 'user')
        choose_admin(project2, admin_membership)
      end
    end

    context 'on Project Users page' do
      given(:sub_campaign) { create(:sub_campaign) }
      given(:admin) { create(:admin, memberships_options: [{ client: sub_campaign.project }]) }

      scenario 'I can create user' do
        create_user(sub_campaign, email: 'user@example.com', first_name: 'Bob', last_name: 'Duke')
      end
    end
  end
end
