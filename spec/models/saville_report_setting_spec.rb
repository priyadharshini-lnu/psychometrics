# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SavilleReportSetting, type: :model do
  it 'downcases saville_report_id before saving' do
    saville_report_setting = create(:saville_report_setting, saville_report_id: 'ABcD')

    expect(saville_report_setting.saville_report_id).to eq('abcd')
  end
end
