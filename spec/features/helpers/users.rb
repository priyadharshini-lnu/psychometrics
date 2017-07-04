module Features
  module Helpers
    module Users
      def create_admin(project, opts = {})
        visit administration_client_projects_path(project.tte)
        find("#client_#{project.id} td .add-icon-box a[data-title='#{t('administration.clients.projects.resource.tooltips.create_admin')}']").click
        wait_for_ajax
        find('label', text: t('administration.clients.users.form_admin.create_admin')).click
        within '#new_resource' do
          fill_in 'resource_user_attributes_email', with: opts[:email]
          fill_in 'resource_user_attributes_first_name', with: opts[:first_name]
          fill_in 'resource_user_attributes_last_name', with: opts[:last_name]
          click_on t('administration.create')
        end
        wait_for_ajax
        admin_membership = Membership.last
        expect(page).to have_content t('administration.memberships.create.successfully', name: admin_membership.decorate.display_name)
        expect(page).to have_css("#client_#{project.id} td", text: admin_membership.decorate.display_name)

        expect(admin_membership.role).to eq Membership::ADMIN_ROLE
        expect(admin_membership.project?).to be true
        expect(admin_membership.client.project?).to be true
        expect(admin_membership.clients_memberships.any?).to be false
        expect(admin_membership.user.grants).to eql User::DEFAULT_ADMIN_GRANTS
        admin_membership
      end

      def choose_admin(project, admin_name)
        visit administration_client_projects_path(project.tte)
        find("#client_#{project.id} td .add-icon-box a[data-title='#{t('administration.clients.projects.resource.tooltips.create_admin')}']").click
        wait_for_ajax
        find('label', text: t('administration.clients.users.form_admin.choose_admin')).click
        within '#existing-inputs' do
          select admin_name, from: 'admin_ids', visible: false
          click_on t('administration.save')
        end
        wait_for_ajax
        admin_membership = Membership.last
        expect(page).to have_content t('administration.memberships.admin_chosen.successfully')
        expect(page).to have_css("#client_#{project.id} td", text: admin_membership.decorate.display_name)

        expect(admin_membership.role).to eq Membership::ADMIN_ROLE
        expect(admin_membership.project?).to be true
        expect(admin_membership.client.project?).to be true
        expect(admin_membership.clients_memberships.any?).to be false
        expect(admin_membership.user.grants).to eql User::DEFAULT_ADMIN_GRANTS
        admin_membership
      end

      def edit_user_privileges(client, membership)
        visit edit_administration_client_user_path(client, membership)
        find('#resource_user_attributes_grants_norms_view', visible: false).trigger('click')
        find('#resource_user_attributes_grants_norms_manage', visible: false).trigger('click')
        find('#resource_user_attributes_grants_dimensions_view', visible: false).trigger('click')
        click_on t('administration.update')
      end
    end
  end
end
