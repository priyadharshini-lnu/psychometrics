# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::PipedText::Branches::FactorFields::Table do
  describe '.call' do
    let(:threesixty_campaign) { create(:threesixty_campaign) }
    let(:assessment) { threesixty_campaign.assessment }
    let!(:factors) { create_list(:factor, 3, dimension: threesixty_campaign.dimension) }

    it 'returns table' do
      response = described_class.call!(
        %w[Table],
        {},
        assessment: assessment
      )

      expect(response).to include('<td>factor 1</td>')
      expect(response).to include('<td>factor 2</td>')
      expect(response).to include('<td>factor 3</td>')
    end
  end
end
