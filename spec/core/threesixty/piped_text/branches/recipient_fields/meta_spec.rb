# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::PipedText::Branches::RecipientFields::Meta do
  describe '.call' do
    let(:threesixty_campaign) { create(:threesixty_campaign) }
    let(:project) { threesixty_campaign.project }
    let(:user) { create(:user, first_name: 'Vasiliy', last_name: 'Pupkin', email: 'my@email.com', project: project) }
    let(:datasheet) { create(:datasheet, project: project) }
    let(:columns) do
      [
        create(:sheet_column, sheet: datasheet, name: 'custom_field', column_type: 'string')
      ]
    end

    before do
      r1 = create(:sheet_row, sheet: datasheet, email: user.email)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], string_value: 'Oops')
    end

    it do
      response = described_class.call!(%w[Meta custom_field], {},
                                       recipient: user, threesixty_campaign: threesixty_campaign)
      expect(response).to eq('Oops')
    end

    it do
      response = described_class.call!(%w[Field undefined_field], {}, recipient: user,
        threesixty_campaign: threesixty_campaign)
      expect(response).to eq(nil)
    end
  end
end
