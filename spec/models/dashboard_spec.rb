# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Dashboard, type: :model do
  describe 'create_flat_datasheet_view' do
    it 'calls command to create datasheet view and saves sha if datasheet is present' do
      dashboard = create(:dashboard)
      datasheet = create(:datasheet, campaign: dashboard.campaign)
      dashboard.reload

      expect(Sheets::CreateFlatSheetView).to receive(:call!).with(datasheet)
      dashboard.create_flat_datasheet_view
    end
  end
end
