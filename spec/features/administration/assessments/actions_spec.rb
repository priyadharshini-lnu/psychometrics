require 'rails_helper'

feature 'Actions Assessment' do
  given!(:assessment) { create(:assessment, name: 'Some Assessment') }
  before { logged_in_as :superadmin }

  context 'Resource List' do
    scenario 'Toggle Status' do
      toggle_assessment(assessment, false)
      expect(assessment.reload.disabled).to be true

      toggle_assessment(assessment)
      expect(assessment.reload.disabled).to be false
    end

    scenario 'Copy Assessment' do
      copy_assessment(assessment)
      expect(page).to have_content 'Some Assessment (1)'
    end
  end

  context 'Sidebar' do
    scenario 'Preview Assessment', :js do
      preview_assessment(assessment)
      expect(page).to have_text('Previewing Assessment')
    end
  end
end
