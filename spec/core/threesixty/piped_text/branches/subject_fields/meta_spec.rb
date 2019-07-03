# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::PipedText::Branches::SubjectFields::Meta do
  describe '.call' do
    let(:project) { create(:project) }
    let(:user) { create(:user, first_name: 'Vasiliy', last_name: 'Pupkin', email: 'my@email.com', project: project) }
    let(:datasheet) { create(:datasheet, project: project) }

    before do
      create(:datasheet_row, datasheet: datasheet, email: user.email, data: { 'custom_field' => 'Oops' })
    end

    it do
      response = described_class.call!(%w[Meta custom_field], {}, subject: user, threesixty_campaign: 'ddd')
      expect(response).to eq('Oops')
    end

    it do
      response = described_class.call!(%w[Field undefined_field], {}, subject: user, threesixty_campaign: 'ddd')
      expect(response).to eq(nil)
    end
  end
end
