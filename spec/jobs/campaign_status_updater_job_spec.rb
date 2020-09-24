# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CampaignStatusUpdaterJob, type: :job do
  include ActiveJob::TestHelper

  subject(:job) { described_class.perform_later }

  it 'queues the job' do
    expect { job }.to change(ActiveJob::Base.queue_adapter.enqueued_jobs, :size).by(1)
  end

  it 'is in cron_tasks queue' do
    expect(CampaignStatusUpdaterJob.new.queue_name).to eq('cron_tasks')
  end

  it 'executes perform' do
    expect_any_instance_of(Campaigns::UpdateCampaignStatus).to receive(:call)
    perform_enqueued_jobs { job }
  end

  after do
    clear_enqueued_jobs
    clear_performed_jobs
  end
end
