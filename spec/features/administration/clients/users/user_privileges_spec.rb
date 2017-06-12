require 'rails_helper'

feature 'User Privileges', clean: false do
  def before_context
    @admin_membership = create(:admin_membership)
    @admin_user = @admin_membership.user
    @client = @admin_membership.client
    @manager_membership = create(:manager_membership, client: @client)
    @norm = create(:norm, owner: @client)
  end

  given(:admin_membership) { @admin_membership.reload }
  given(:admin_user) { @admin_user.reload }
  given(:client) { @client.reload }
  given(:manager_membership) { @manager_membership.reload }
  given(:norm) { @norm.reload }
  # TODO: fix
=begin
  context 'As SuperAdmin user' do
    before(:context) { reload_context }
    before { logged_in_as :superadmin }

    scenario 'I can see privileges tab for Admin user' do
      visit edit_administration_client_user_path(client, admin_membership)
      expect(page).to have_css("a[href='#tab-grants']", text: t('administration.users.edit.grants'))
    end

    scenario 'I can not see privileges tab for Manager' do
      visit edit_administration_client_user_path(client, manager_membership)
      expect(page).to have_no_content(t('administration.users.edit.grants'))
    end

    scenario 'I can edit Admin user privileges' do
      edit_user_privileges(client, admin_membership)
      expect(page).to have_content(t('administration.memberships.update.successfully', name: admin_user.decorate.display_name))
      expect(page).to have_css('.grants-table input[checked]', visible: false, count: 3)
    end
  end
=end

  context 'As Admin user' do
    before(:context) { reload_context }
    before { login_as admin_user }

    context 'without privileges' do
      scenario 'I can not see entities' do
        visit administration_root_path
        expect(page).to have_no_css('span.xn-text', text: t('administration.navigation.norms'))
        expect(page).to have_no_css('span.xn-text', text: t('administration.navigation.dimensions'))
      end
    end

    context 'with privileges' do
      before(:all) do
        @admin_user.grants = { norms: { view: true, manage: true }, dimensions: { view: true } }
        @admin_user.save!
      end
      before { login_as admin_user }
      # TODO: fix
      # scenario 'I can see only allowed entities' do
      #   visit administration_root_path
      #   expect(page).to have_content(t('administration.navigation.norms'))
      #   expect(page).to have_content(t('administration.navigation.dimensions'))
      #   expect(page).to have_no_content(t('administration.navigation.assessments'))
      # end

      scenario 'I can manage norms' do
        visit administration_norms_path
        find('.panel-heading a', text: t('administration.norms.index.new')).click
        expect(page).to have_css('h4.modal-title', text: t('administration.norms.new.header'))
      end

      scenario "I can't manage dimensions" do
        visit administration_dimensions_path
        expect(page).to have_no_css('.panel-heading a', text: t('administration.dimensions.index.new'))
      end
    end
  end
end
