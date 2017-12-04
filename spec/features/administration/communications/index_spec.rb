require 'rails_helper'

feature 'Operations on communications#index', js: true do
  context 'as superadmin' do
    before(:each) do
      enter_as :superadmin
    end

    let!(:count_of_communications) { 5 }
    let!(:path_to_translations) { 'administration.communications.form.' }
    let!(:project) { create(:project_base) }
    let!(:default_ordered_communications) { Communication.all }

    before do
      create_list(:communication, count_of_communications, client_id: project.id)
    end

    scenario 'Visit communications#index' do
      visit '/administration/communications'
      expect(page).to have_css('tr[data-sidebar]')
      expect(page.all('tbody tr').size).to eq(count_of_communications)
    end

    scenario 'Click on communication' do
      visit '/administration/communications'
      first('tr[data-sidebar]').click
      wait_for_ajax
      expect(page).to have_content("COMMUNICATION'S OPTIONS")
    end

    context 'Sorting by Communication subject' do

      let!(:new_communication) { create(:communication, subject: 'AAAAAA', client_id: project.id ) }

      before do
        visit '/administration/communications'
        find('a', text: I18n.t('administration.communications.list.subject')).click
      end

      scenario 'Sort by Communication subject' do
        expect(page.all('tbody tr')[0].text).to include(new_communication.subject)
      end

      scenario 'Unsort by Communication subject' do
        find('a.sort_link.asc').click
        expect(page.all('tbody tr')[0].text).to include(
          default_ordered_communications.first.subject)
      end
    end

    context 'Sorting by created_at' do

      let!(:new_communication) { create(:communication,
        created_at: Time.current - 100.minutes, client_id: project.id ) }

      before do
        visit '/administration/communications'
        find('a', text: I18n.t('administration.communications.list.created_at')).click
      end

      scenario 'Click to sort ascending for created_at' do
        expect(page.all('tbody tr')[0].text).
        to include(new_communication.decorate.created_at)
      end

      scenario 'Click to sort descending for created_at' do
        find('a.sort_link.asc').click
        expect(page.all('tbody tr')[0].text).
        to include(default_ordered_communications.first.decorate.created_at)
      end
    end

    scenario 'Search for subject' do
      text = Forgery('internet').email_subject
      create(:communication, subject: text, client_id: project.id )
      visit '/administration/communications'
      within '.list-filter' do
        fill_in 'q_subject_or_body_cont', with: text
      end
      wait_for_ajax
      sleep 2
      expect(page.all('tbody tr').size).to eq(1)
    end

    scenario 'Filter by type' do
      create(:communication, kind: 'reminder', client_id: project.id )
      visit '/administration/communications'
      within '.list-filter' do
        find('button[data-id=q_kind_in]').click
        find('.q_kind_in ul > li:nth-child(2) a').click
      end
      wait_for_ajax
      expect(page.all('tbody tr').size).to eq(1)
    end
  end
end
