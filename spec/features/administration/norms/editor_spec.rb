require 'rails_helper'

feature 'Norm Editor' do
  given!(:norm) { create(:norm, name: 'Some Norm') }
  before { logged_in_as :superadmin }

  scenario 'Edit factors' do
    visit '/administration/norms'
    click_norm norm
    click_on t('administration.norms.sidebar.editor')
    first_row = first('table.selectable.mbn tbody tr').all('td')
    very_low_from = first_row[1]
    very_low_to = first_row[2]
    very_low_to.click
    within 'form.editableform' do
      find('input').set 20
      find("button[type='submit']").click
    end
    wait_for_ajax
    expect(norm.factors_norms.first.props[0]['score_to']).to eq('20')

    very_low_from.click
    within 'form.editableform' do
      find('input').set 30
      find("button[type='submit']").click
    end
    wait_for_ajax
    expect(page).to have_text(t('activerecord.errors.models.factors_norm.score_to_less_than_score_from'))

    within 'form.editableform' do
      find('input').set 12
      find("button[type='submit']").click
    end
    wait_for_ajax
    expect(norm.factors_norms.first.props[0]['score_from']).to eq('12')
  end
end
