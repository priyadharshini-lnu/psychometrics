# frozen_string_literal: true

require 'rails_helper'

describe Datasheets::Export do
  let(:datasheet) { create(:datasheet, columns: { 'Email' => 'String', 'Profile' => 'Text' }) }
  let!(:datasheet_row) do
    create(:datasheet_row, datasheet: datasheet, email: 'james@cc.com', data: { 'Profile' => 'carpenter' })
  end
  let(:file_name) { "datasheet-#{Time.now}.xlsx" }

  after do
    FileUtils.rm(file_name) if File.exist?(file_name)
  end

  before do
    @xlsx = described_class.call!(datasheet)
    @xlsx.serialize(file_name)
    @xlsx = Roo::Spreadsheet.open(file_name)
  end

  it 'returns datasheet column name as a first row' do
    first_row = @xlsx.sheet(0).row(1)

    expect(first_row).to eq(%w[Email Profile])
  end

  it 'returns datasheet column type as second row' do
    first_row = @xlsx.sheet(0).row(2)

    expect(first_row).to eq(%w[String Text])
  end

  it 'returns datasheet row value' do
    first_row = @xlsx.sheet(0).row(3)

    expect(first_row).to eq(%w[james@cc.com carpenter])
  end
end
