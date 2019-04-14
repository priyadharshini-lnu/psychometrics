# frozen_string_literal: true

require 'rails_helper'

describe Results::SubjectSerializer do
  describe '#to_hash' do
    let(:user) { create(:user, email: 'dustin@poirier.com') }
    let(:project) { create(:project) }
    let(:campaign) { create(:campaign, project: project) }
    let(:subject) { create(:threesixty_subject, user: user, campaign: campaign) }

    before do
      create(:datasheet_row, datasheet:
        create(:datasheet, project: project),
             data: { a: 1, b: 'tmp' }, email: 'dustin@poirier.com')
    end

    it do
      result = described_class.new(subject).to_hash
      expect(result[:data_sheet]).to eq('a' => 1, 'b' => 'tmp')
      expect(result[:user][:email]).to eq 'dustin@poirier.com'
    end
  end
end
