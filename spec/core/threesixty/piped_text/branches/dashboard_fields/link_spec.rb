# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::PipedText::Branches::DashboardFields::Link do
  describe '.call' do
    let(:user) { create(:user, project: create(:project)) }

    it do
      response = described_class.call!(%w[Link], { 'd' => 'Join the assessment' }, recipient: user, threesixty_campaign: 'ddd')
      expect(response).to match(/Join the assessment/)
      expect(response).to match(/<a href=/)
    end
  end
end
