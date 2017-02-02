require 'rails_helper'

feature 'Actions Norm' do
  given!(:norm) { create(:norm, name: 'Some Norm') }
  before { logged_in_as :superadmin }

  context 'Resource List' do
    scenario 'Toggle Status' do
      toggle_norm(norm, false)
      expect(norm.reload.disabled).to be true

      toggle_norm(norm)
      expect(norm.reload.disabled).to be false
    end

    scenario 'Copy Norm' do
      copy_norm(norm)
      expect(page).to have_content 'Some Norm (1)'
    end
  end

  context 'Sidebar' do
    scenario 'Export/Import Norm', :js do
      file = export_norm(norm)
      new_norm = import_norm file
      expect(new_norm.name).to eq('Some Norm (1)')
      expect(new_norm.factors_norms.size).to eq(norm.factors_norms.size)
      expect(new_norm.factors.pluck(:id).sort).to eq(norm.factors.pluck(:id).sort)
    end
  end
end
