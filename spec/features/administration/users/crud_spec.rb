# frozen_string_literal: true

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
        # follow_superadmin_invitation
      end
    end

    context 'on Projects page' do
      scenario 'I can create project admin' do
        create_project_admin(project, email: 'admin@example.com', first_name: 'admin', last_name: 'user')
        follow_admin_invitation
      end

      context 'with existing user' do
        given!(:user) { create(:user, email: 'admin@example.com', role: 'Users::Admin') }

        scenario 'I can create new project admin' do
          create_project_admin(project2, email: 'admin@example.com') do
            new_admin_membership = Membership.last
            expect(new_admin_membership.client_id).to eq(project2.id)
            expect(new_admin_membership.user.id).to eq(user.id)
          end
        end
      end

      scenario 'I can create project admin with limit privileges' do
        visit administration_client_projects_path(project.tte)
        href = new_step_1_administration_client_project_admins_path(project)
        find("#client_#{project.id} td .add-icon-box a[href='#{href}']").click
        wait_for_ajax

        within '.new_prepare_user' do
          fill_in 'prepare_user_email', with: 'konor@mac.gregor'
          click_on 'Next'
        end
        wait_for_ajax
        within('#new_resource .grants-table') do
          expect(page).to have_content 'Assessments'
          expect(page).to have_content 'Data Centre (Exporting Assessment / Report data sets)'
          expect(page).to have_content 'Campaigns & Sub-Campaigns'
          expect(page).to have_content 'Communication Centre'
          expect(page).to have_content 'Overview Reports'

          expect(page).not_to have_css :td, text: 'Norms'
          expect(page).not_to have_css :td, text: 'Dimensions'
          expect(page).not_to have_css :td, text: 'Translations'
          expect(page).not_to have_css :td, text: 'Client Tenancies'
          expect(page).not_to have_css :td, text: 'Question Centre'
          expect(page).not_to have_css :td, text: 'Media Libraries'
        end
      end
    end

    context 'on Project Users page' do
      given(:sub_campaign) { create(:sub_campaign) }

      scenario 'I can create user' do
        create_user(sub_campaign, email: 'user@example.com', first_name: 'Bob', last_name: 'Duke')
        # follow_user_invitation
      end
    end
  end

  context 'As Client Admin' do
    before { login_as client_admin }

    context 'on Projects page' do
      given(:client_admin) { create(:client_admin, memberships_options: [{ client: project.root }]) }

      scenario 'I can create admin user' do
        create_project_admin(project, email: 'admin@example.com', first_name: 'admin', last_name: 'user')
      end
    end

    context 'on Project Users page' do
      given(:sub_campaign) { create(:sub_campaign) }
      given(:client_admin) { create(:client_admin, memberships_options: [{ client: sub_campaign.root }]) }

      scenario 'I can create user' do
        create_user(sub_campaign, email: 'user@example.com', first_name: 'Bob', last_name: 'Duke')
      end
    end

    context 'on Client Tenancy page' do
      let(:tenancy) { project.root }
      given(:client_admin) { create(:client_admin, memberships_options: [{ client: tenancy }]) }

      context 'with Privileges to manage Client Tenancies' do
        before do
          client_admin.memberships.first.grants.
            update(data: client_admin.memberships.first.grants.data.merge(clients: [:manage]))
        end

        scenario 'I can create another Client Admin' do
          visit administration_client_path(tenancy)
          href = new_step_1_administration_client_client_admins_path(tenancy)
          expect(page).to have_css("#client_#{tenancy.id} td .add-icon-box a[href='#{href}']")
        end

        scenario 'I can create another Client Admin only with my Privileges' do
          visit administration_client_path(tenancy)
          href = new_step_1_administration_client_client_admins_path(tenancy)
          find("#client_#{tenancy.id} td .add-icon-box a[href='#{href}']").click
          wait_for_ajax
          fill_in 'prepare_user_email', with: 'romero@gmail.com'
          click_on 'Next'
          wait_for_ajax

          expect(page).to have_css('#new_resource .grants-table')
          within('#new_resource .grants-table') do
            expect(page).to have_content 'Assessments'
            expect(page).not_to have_content 'Data Centre (Exporting Assessment / Report data sets)'
            expect(page).not_to have_content 'Campaigns & Sub-Campaigns'
            expect(page).to have_content 'Communication Centre'
            expect(page).not_to have_content 'Overview Reports'
          end
        end
      end

      context 'without Privileges to manage Client Tenancies' do
        before { client_admin.memberships.first.grants.update(data: {}) }

        scenario 'I cant create another Client Admin' do
          visit administration_client_path(tenancy)
          href = new_step_1_administration_client_client_admins_path(tenancy)
          expect(page).not_to have_css("#client_#{tenancy.id} td .add-icon-box a[href='#{href}']")
        end
      end
    end
  end

  context 'As Project Admin' do
    given(:project_admin) { create(:project_admin, memberships_options: [{ client: project }]) }

    before { login_as project_admin }

    context 'on Projects page' do
      scenario 'I cant create or choose Project Admin user' do
        visit administration_client_projects_path(project)
        href = new_administration_client_project_admin_path(project)
        expect(page).not_to have_css("#client_#{project.id} td .add-icon-box a[href='#{href}']")
      end
    end

    scenario 'I cant create Client Admin' do
      tenancy = project.root
      visit administration_client_path(tenancy)
      href = new_administration_client_client_admin_path(tenancy)
      expect(page).not_to have_css("#client_#{tenancy.id} td .add-icon-box a[href='#{href}']")
    end
  end
end
