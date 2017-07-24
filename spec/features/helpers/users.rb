module Features
  module Helpers
    module Users
      def create_superadmin(opts = {})
        visit administration_users_path
        click_link(t('administration.users.index.new_superadmin'), href: '/administration/users/new')
        find('.modal-header').click
        within '#new_resource' do
          fill_in 'resource_email', with: opts[:email]
          fill_in 'resource_first_name', with: opts[:first_name]
          fill_in 'resource_last_name', with: opts[:last_name]
          click_on t('administration.create')
        end
        wait_for_ajax
        if block_given?
          yield
        else
          superadmin = User.last
          expect(page).to have_content t('administration.users.create.successfully', name: superadmin.decorate.display_name)
          expect(page).to have_css("#users_list td", text: superadmin.decorate.display_name)
          expect(superadmin.role).to eq User::SUPER_ADMIN_ROLE
          superadmin
        end
      end

      def create_admin(project, opts = {})
        visit administration_client_projects_path(project.tte)
        find("#client_#{project.id} td .add-icon-box a[href='#{new_administration_client_user_path(project, admin: true)}']").click
        find('label', text: t('administration.clients.users.form_admin.create_admin')).click
        within '#new_resource' do
          fill_in 'resource_user_attributes_email', with: opts[:email]
          fill_in 'resource_user_attributes_first_name', with: opts[:first_name]
          fill_in 'resource_user_attributes_last_name', with: opts[:last_name]
          click_on t('administration.create')
        end
        wait_for_ajax
        if block_given?
          yield
        else
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
      end

      def choose_admin(project, admin_membership)
        visit administration_client_projects_path(project.tte)
        find("#client_#{project.id} td .add-icon-box a[href='#{new_administration_client_user_path(project, admin: true)}']").click
        find('label', text: t('administration.clients.users.form_admin.choose_admin')).click
        within '#existing-inputs' do
          select admin_membership.decorate.display_name, from: 'admin_ids', visible: false
          click_on t('administration.save')
        end
        wait_for_ajax
        if block_given?
          yield
        else
          new_admin_membership = Membership.last
          expect(page).to have_content t('administration.memberships.admin_chosen.successfully')
          expect(page).to have_css("#client_#{project.id} td", text: new_admin_membership.decorate.display_name)
          expect(new_admin_membership.role).to eq Membership::ADMIN_ROLE
          expect(new_admin_membership.project?).to be true
          expect(new_admin_membership.client.project?).to be true
          expect(new_admin_membership.clients_memberships.any?).to be false
          expect(new_admin_membership.user.grants).to eql User::DEFAULT_ADMIN_GRANTS
          expect(new_admin_membership.user).to eql(admin_membership.user)
          new_admin_membership
        end
      end

      def edit_user_privileges(client, membership)
        visit edit_administration_client_user_path(client, membership)
        find('#resource_user_attributes_grants_norms_view', visible: false).trigger('click')
        find('#resource_user_attributes_grants_norms_manage', visible: false).trigger('click')
        find('#resource_user_attributes_grants_dimensions_view', visible: false).trigger('click')
        click_on t('administration.update')
      end

      def follow_superadmin_invitation
        email = Capybara::Node::Simple.new(ActionMailer::Base.deliveries.last.body.to_s)
        accept_link = email.find("a", text: t("devise.mailer.invitation_instructions.accept"))
        page.driver.browser.clear_cookies
        visit accept_link[:href]
        expect(page).to have_css(:h1, text: t('administration.administrator.invitations.edit.title'))
      end
    end
  end
end
