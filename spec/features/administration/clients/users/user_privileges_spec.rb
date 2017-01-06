require 'rails_helper'

feature 'User Privileges' do
  let(:admin_membership) { create(:admin_membership) }
  let(:admin_user) { admin_membership.user }
  let(:client) { admin_membership.client }
  let(:manager_membership) { create(:manager_membership, client: client) }

  context 'SuperAdmin' do
    before { logged_in_as :superadmin }

    scenario 'SuperAdmin able to see privileges tab for Admin' do
      admin_privileges_tab
      manager_privileges_tab
    end

    scenario 'SuperAdmin able to edit privileges' do
      edit_privileges
    end
  end

  context 'Admin user with no privileges' do
    before { login_as admin_user }

    scenario "Admin can't see entities" do
      no_admin_entities
    end
  end

  context 'Admin user with privileges' do
    let(:grants) { { norms: { view: true, manage: true }, dimensions: { view: true } } }
    let(:admin_membership) { create(:admin_membership, user: create(:user, grants: grants)) }
    let!(:norm) { create(:norm, owner: client) }

    before do
      login_as admin_user
    end

    scenario 'Admin can see only allowed entities' do
      visit administration_root_path
      expect(page).to have_content(t('administration.navigation.norms'))
      expect(page).to have_content(t('administration.navigation.dimensions'))
      expect(page).to have_no_content(t('administration.navigation.assessments'))
    end

    scenario 'Admin can manage norms' do
      visit administration_norms_path
      find(".panel-controls a[data-title='Create']").click
      expect(page).to have_css('h4.modal-title', text: t('administration.norms.new.header'))
    end

    scenario "Admin can't manage dimensions" do
      visit administration_dimensions_path
      expect(page).to have_no_css(".panel-controls a[data-title='Create']")
    end
  end

  private

  def admin_privileges_tab
    visit edit_administration_client_user_path(client, admin_membership)
    expect(page).to have_css("a[href='#tab-grants']", text: t('administration.users.edit.grants'))
  end

  def manager_privileges_tab
    visit edit_administration_client_user_path(client, manager_membership)
    expect(page).to have_no_content(t('administration.users.edit.grants'))
  end

  def edit_privileges
    visit edit_administration_client_user_path(client, admin_membership)
    find('#resource_user_attributes_grants_norms_view', visible: false).trigger('click')
    find('#resource_user_attributes_grants_norms_manage', visible: false).trigger('click')
    find('#resource_user_attributes_grants_dimensions_view', visible: false).trigger('click')
    click_on t('administration.update')
    expect(page).to have_content(t('administration.memberships.update.successfully', name: admin_user.decorate.display_name))
    expect(page).to have_css('.grants-table input[checked]', visible: false, count: 3)
  end

  def no_admin_entities
    visit administration_root_path
    expect(page).to have_no_css('span.xn-text', text: t('administration.navigation.norms'))
    expect(page).to have_no_css('span.xn-text', text: t('administration.navigation.dimensions'))
  end
end
