# frozen_string_literal: true

require 'rails_helper'

describe ::Datasheets::GetColumnDefinition do
  let(:project) { create(:project) }
  let(:datasheet) do
    create(:datasheet, project: project, columns: { 'Email' => 'String', 'Name' => 'String', 'Profile' => 'Text' })
  end

  it 'returns array of column definition with only Email as a visible field' do
    result = described_class.call!(datasheet)

    expect(result).to eq([
                           { id: 'Email', type: 'String', visible: true },
                           { id: 'Name', type: 'String', visible: false },
                           { id: 'Profile', type: 'Text', visible: false }
                         ])
  end

  it 'returns visible true for all columns which are saved in datasheet_column_preference' do
    create(:datasheet_column_preference, resource: project, visible_columns: %w[Email Name])

    result = described_class.call!(datasheet)

    expect(result).to eq([
                           { id: 'Email', type: 'String', visible: true },
                           { id: 'Name', type: 'String', visible: true },
                           { id: 'Profile', type: 'Text', visible: false }
                         ])
  end
end
