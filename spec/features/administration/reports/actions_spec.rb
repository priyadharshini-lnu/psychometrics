require 'rails_helper'

feature 'Actions Report' do
  given!(:report) { create(:report, name: 'Some Report') }
  before { logged_in_as :superadmin }

  context 'Resource List' do
    scenario 'Toggle Status' do
      enable_report(report)
      expect(report.reload.disabled).to be true

      disable_report(report)
      expect(report.reload.disabled).to be false
    end

    scenario 'Copy Report' do
      copy_report(report)
      expect(page).to have_content 'Some Report (1)'
    end
  end
end
