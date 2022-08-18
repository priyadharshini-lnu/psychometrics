# frozen_string_literal: true

require 'rails_helper'

describe Api::UserSearchQuery do
  let!(:project) { create(:project) }
  let!(:user1) { create(:user, first_name: 'John', project: project) }
  let!(:user2) { create(:user, first_name: 'Jane', project: project) }
  let!(:datasheet) { create(:datasheet, project: project) }
  let!(:datasheet_row1) do
    create(:datasheet_row, datasheet: datasheet, email: user1.email, data: {
      'Department' => 'IT',
      'Sector' => 'Aerospace'
    })
  end
  let!(:datasheet_row2) do
    create(:datasheet_row, datasheet: datasheet, email: user2.email, data: {
      'Department' => 'IT',
      'Sector' => 'Consulting'
    })
  end

  it 'searches by datasheet' do
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

  it 'searches by user field and datasheet' do
    expect(described_class.new(project, {
      first_name: user1.first_name,
      datasheet: {
        'Department' => 'IT'
      }
    }).query.to_a).to eq([user1])
  end
end
