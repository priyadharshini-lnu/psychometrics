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
        #follow_superadmin_invitation
      end
    end

    context 'on Projects page' do
      scenario 'I can create project admin' do
        create_project_admin(project, email: 'admin@example.com', first_name: 'admin', last_name: 'user')
        follow_admin_invitation
      end

      context 'with existing client admin' do
        given(:admin_membership) { create(:project_admin_membership, client: project) }

        scenario 'I can choose client admin' do
          choose_project_admin(project2, admin_membership)
        end
      end

      context 'another Client Admin' do
        given(:admin) { create(:project_admin) }

        scenario 'I cant assign client admin from another tenancy' do
          create_project_admin(project, email: admin.email, first_name: 'Bob', last_name: 'Duke') do
            expect(page).to have_css('form#new_resource .alert-danger')
            expect(page).to have_content(t('activerecord.errors.messages.admin_for_another_tte'))
          end
        end
      end

      scenario 'I can create project admin with limit privileges' do
        visit administration_client_projects_path(project.tte)
        find("#client_#{project.id} td .add-icon-box a[href='#{new_administration_client_project_admin_path(project)}']").click
        find('label', text: t('administration.clients.project_admins.form.create_admin')).click
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
        #follow_user_invitation
      end
    end
  end

  context 'As Client Admin' do
    before { login_as client_admin }

    context 'on Projects page' do
      given(:client_admin) { create(:client_admin, memberships_options: [{ client: project2.root }]) }

      scenario 'I can create or choose admin user' do
        admin_membership = create_project_admin(project, email: 'admin@example.com', first_name: 'admin', last_name: 'user')
        choose_project_admin(project2, admin_membership)
      end

      skip 'I can create project admin with privileges limited by admin\'s privileges' do
        visit administration_client_projects_path(project.tte)
        find("#client_#{project.id} td .add-icon-box a[href='#{new_administration_client_project_admin_path(project)}']").click
        find('label', text: t('administration.clients.project_admins.form.create_admin')).click
        within('#new_resource .grants-table') do
          expect(page).to have_content 'Assessments'
          expect(page).not_to have_content 'Data Centre (Exporting Assessment / Report data sets)'
          expect(page).not_to have_content 'Campaigns & Sub-Campaigns'
          expect(page).to have_content 'Communication Centre'
          expect(page).not_to have_content 'Overview Reports'
        end
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
        before { client_admin.update!(grants: client_admin.grants.merge({ clients: [:manage] })) }

        scenario 'I can create another Client Admin' do
          visit administration_client_path(tenancy)
          expect(page).to have_css("#client_#{tenancy.id} td .add-icon-box a[href='#{new_administration_client_client_admin_path(tenancy)}']")
        end

        skip 'I can create another Client Admin only whith my Privileges' do
          visit administration_client_path(tenancy)
          find("#client_#{tenancy.id} td .add-icon-box a[href='#{new_administration_client_client_admin_path(tenancy)}']").click
          expect(page).to have_css('label', text: t('administration.clients.client_admins.form.create_admin'))
          find('label', text: t('administration.clients.client_admins.form.create_admin')).click
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
        before { client_admin.update!(grants: {}) }

        scenario 'I cant create another Client Admin' do
          visit administration_client_path(tenancy)
          expect(page).not_to have_css("#client_#{tenancy.id} td .add-icon-box a[href='#{new_administration_client_client_admin_path(tenancy)}']")
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
        expect(page).not_to have_css("#client_#{project.id} td .add-icon-box a[href='#{new_administration_client_project_admin_path(project)}']")
      end
    end

    scenario 'I cant create Client Admin' do
      tenancy = project.root
      visit administration_client_path(tenancy)
      expect(page).not_to have_css("#client_#{tenancy.id} td .add-icon-box a[href='#{new_administration_client_client_admin_path(tenancy)}']")
    end
  end
end
