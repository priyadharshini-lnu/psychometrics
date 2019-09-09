# frozen_string_literal: true

module Features
  module Helpers
    module Users
      def create_superadmin(opts = {})
        visit administration_users_path
        click_link(t('administration.users.index.new_superadmin'), href: '/administration/users/new')
        find('.modal-header').click
        sleep 1
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
          expect(page).to have_content t('administration.users.create.successfully',
                                         name: superadmin.decorate.display_name)
          expect(page).to have_css('#users_list td', text: superadmin.decorate.display_name)
          expect(superadmin.role).to eq User::SUPER_ADMIN_ROLE
          superadmin
        end
      end

      def create_project_admin(project, opts = {})
        visit administration_client_projects_path(project.tte)
        href = new_step_1_administration_client_project_admins_path(project)
        find("#client_#{project.id} td .add-icon-box a[href='#{href}']").click
        wait_for_ajax
        within '.new_prepare_user' do
          fill_in 'prepare_user_email', with: opts[:email]
          click_on 'Next'
        end
        wait_for_ajax
        within '#new_resource' do
          fill_in 'resource_user_attributes_first_name', with: opts[:first_name] if opts[:first_name]
          fill_in 'resource_user_attributes_last_name', with: opts[:last_name] if opts[:last_name]
          click_on 'Create'
        end
        wait_for_ajax
        if block_given?
          yield
        else
          wait_for_ajax
          admin_membership = Membership.last
          expect(page).to have_content t('administration.memberships.create.successfully',
                                         name: admin_membership.decorate.display_name)
          expect(page).to have_css("#client_#{project.id} td", text: admin_membership.decorate.display_name)
          expect(admin_membership.role).to eq Membership::PROJECT_ADMIN_ROLE
          expect(admin_membership.project?).to be true
          expect(admin_membership.client.project?).to be true
          expect(admin_membership.clients_memberships.any?).to be false
          expect(admin_membership.grants.data).to eql(User::DEFAULT_PROJECT_ADMIN_GRANTS)
          admin_membership
        end
      end

      def choose_project_admin(project, admin_membership)
        visit administration_client_projects_path(project.tte)
        href = new_administration_client_project_admin_path(project)
        find("#client_#{project.id} td .add-icon-box a[href='#{href}']").click
        find('label', text: t('administration.clients.project_admins.form.choose_admin')).click
        within '#existing-inputs' do
          select admin_membership.decorate.display_name, from: 'project_admin_ids', visible: false
          click_on t('administration.save')
        end
        wait_for_ajax
        if block_given?
          yield
        else
          new_admin_membership = Membership.last
          expect(page).to have_content t('administration.memberships.admin_chosen.successfully')
          expect(page).to have_css("#client_#{project.id} td", text: new_admin_membership.decorate.display_name)
          expect(new_admin_membership.role).to eq Membership::PROJECT_ADMIN_ROLE
          expect(new_admin_membership.project?).to be true
          expect(new_admin_membership.client.project?).to be true
          expect(new_admin_membership.clients_memberships.any?).to be false
          expect(new_admin_membership.user.grants).to eql(User::DEFAULT_PROJECT_ADMIN_GRANTS)
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

      def create_user(client, opts = {})
        visit administration_client_users_path(client)
        click_link(t('administration.clients.users.index.new'), href: "/administration/clients/#{client.id}/users/new")
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
          user_membership = Membership.last
          expect(page).to have_content t('administration.memberships.create.successfully',
                                         name: user_membership.decorate.display_name)
          expect(page).to have_css("#membership_#{user_membership.id} td", text: user_membership.user.email)
          expect(user_membership.role).to eq Membership::MEMBER_ROLE

          if client.subtenancy?
            project_membership = user_membership.project_membership
            expect(project_membership.project?).to be true
            expect(project_membership.client_id).to eql client.project.id
            expect(project_membership.clients_memberships.size).to eql 1
            expect(project_membership.clients_memberships.take).to eq user_membership

            expect(user_membership.project?).to be false
            expect(user_membership.client.subtenancy?).to be true
          else
            expect(user_membership.project?).to be true
            expect(user_membership.client.project?).to be true
            expect(user_membership.clients_memberships.any?).to be false
          end
          user_membership
        end
      end

      def follow_superadmin_invitation
        page.driver.browser.manage.delete_all_cookies
        # the same as user invitation
        # follow_user_invitation
      end

      def follow_admin_invitation
        page.driver.browser.manage.delete_all_cookies
        # the same as user invitation
        # follow_user_invitation
      end

      def follow_user_invitation
        email = Capybara::Node::Simple.new(ActionMailer::Base.deliveries.last.body.to_s)
        ActionMailer::Base.deliveries = []
        accept_link = email.find('a', text: t('devise.mailer.invitation_instructions.accept'))
        visit accept_link[:href]
        expect(page).to have_css(:h1, text: t('administration.administrator.invitations.edit.title'))
      end
    end
  end
end
