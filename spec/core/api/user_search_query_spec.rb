# frozen_string_literal: true

require 'rails_helper'

describe Api::UserSearchQuery do
  let!(:project) { create(:project) }
  let!(:user1) { create(:user, first_name: 'John', project: project) }
  let!(:user2) { create(:user, first_name: 'Jane', project: project) }
  let!(:sheet) { create(:sheet, project: project) }
  let!(:sheet_row1) do
    create(:sheet_row, sheet: sheet, email: user1.email, data: {
      'Department' => 'IT',
      'Sector' => 'Aerospace'
    })
  end
  let!(:sheet_row2) do
    create(:sheet_row, sheet: sheet, email: user2.email, data: {
      'Department' => 'IT',
      'Sector' => 'Consulting'
    })
  end

  it 'searches by sheet' do
    expect(described_class.new(project, {
      datasheet: {
        'Department' => 'IT',
        'Sector' => 'Aerospace'
      }
    }).query.to_a).to eq([user1])
    expect(described_class.new(project, {
      datasheet: {
        'Department' => 'IT'
      }
    }).query.to_a).to match_array([user1, user2])
  end

  it 'searches by user fields' do
    expect(described_class.new(project, {
      first_name: user1.first_name
    }).query.to_a).to eq([user1])
  end

  it 'searches by user field and sheet' do
    expect(described_class.new(project, {
      first_name: user1.first_name,
      datasheet: {
        'Department' => 'IT'
      }
    }).query.to_a).to eq([user1])
  end
end
