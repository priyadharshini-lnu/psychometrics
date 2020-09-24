# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::UpdateCampaignStatus do
  context '.call' do
    let(:campaign1) { create(:campaign) }
    let(:campaign2) { create(:campaign, status: 'active', start_date: 30.minutes.ago, end_date: Time.now) }
    let(:connection) { double('Connection') }

    before do
      Timecop.return
    end

    subject { described_class.call }

    it { expect { subject }.to broadcast(:ok) }

    it 'executes sql' do
      expect(ActiveRecord::Base).to receive(:connection) { connection }
      expect(connection).to receive(:execute)

      subject
    end

    it 'activates campaigns that are due' do
      expect { subject }.to change { campaign1.reload.status }.from('inactive').to('active')

      subject
    end

    it 'closes campaigns that have ended' do
      expect { subject }.to change { campaign2.reload.status }.from('active').to('closed')

      subject
    end
  end
end
