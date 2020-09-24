# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CampaignStatusUpdaterJob, type: :job do
  include ActiveJob::TestHelper

  let(:campaign1) { create(:campaign) }
  let(:campaign2) { create(:campaign) }
  let(:connection) { double('Connection') }

  before do
    attributes = {
      status: 'active',
      start_date: Time.now - 30.minutes,
      end_date: Time.now
    }
    campaign2.update_attributes(attributes)
  end

  context '#perform' do
    subject { described_class.perform_now }

    it 'runs the job' do
      expect(ActiveRecord::Base).to receive(:connection) { connection }
      expect(connection).to receive(:execute)
      
      subject
    end

    it 'updates status of matched records' do
      # expect(campaign1.reload.status).to eq('active')
      # expect(campaign2.reload.status).to eq('closed')

      expect { subject }.to change { campaign1.reload.status }.from('inactive').to('active')
      expect { subject }.to change { campaign2.reload.status }.from('active').to('closed')

      subject
    end
  end

  after do
    clear_enqueued_jobs
    clear_performed_jobs
  end
end
