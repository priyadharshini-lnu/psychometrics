# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Evaluators::SearchInDatasheetQuery do
  let(:user) { create(:user, email: 'user@a.com') }
  let(:subject) { create(:user, email: 'subject@a.com') }
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }
  let!(:datasheet) do
    create(:datasheet, project_id: threesixty_campaign.project.id)
  end
  let!(:columns) do
    [
      create(:sheet_column, sheet: datasheet, name: 'First Name', column_type: 'string'),
      create(:sheet_column, sheet: datasheet, name: 'Last Name', column_type: 'string')
    ]
  end
  let!(:r1) { create(:sheet_row, sheet: datasheet, email: user.email) }
  let!(:r2) { create(:sheet_row, sheet: datasheet, email: subject.email) }

  describe '.call check conditions' do
    before do
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], string_value: 'first')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], string_value: 'user')
      create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[0], string_value: 'user')
      create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[1], string_value: 'second')
    end

    it 'should find user by query' do
      result = described_class.new(threesixty_campaign.campaign, subject, 'first').query
      expect(result.size).to eq(1)

      expect(result.first.attributes).to eq({
        'id' => r1.id,
        'email' => user.email,
        'first_name' => 'first',
        'last_name' => 'user'
      })
    end

    it 'should find users by email' do
      result = described_class.new(threesixty_campaign.campaign, subject, 'a.com').query
      expect(result.size).to eq(2)
      expect(result.map(&:first_name)).to eq(%w[first user])
    end

    it 'should find users by first name or last name' do
      result = described_class.new(threesixty_campaign.campaign, subject, 'user').query
      expect(result.size).to eq(2)
      expect(result.map(&:first_name)).to eq(%w[first user])
    end
  end
end
