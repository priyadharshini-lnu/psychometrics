# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectMailDeliveryJob, type: :job do
  it 'includes Sidekiq::Throttled::Job' do
    expect(ProjectMailDeliveryJob.included_modules).to include(Sidekiq::Throttled::Job)
  end

  it 'has sidekiq throttle configuration defined' do
    strategy = Sidekiq::Throttled::Registry.get(ProjectMailDeliveryJob)
    expect(strategy).not_to be_nil

    test_result = {
      key_suffix: 'spec',
      concurrency_limit: 7,
      rate_limit: 11,
      rate_period: 2.minutes
    }

    allow(MailerRateLimit).to receive(:for).and_return(test_result)

    job_args = %w[UserMailer welcome_email deliver_now]

    concurrency_strategy = strategy.concurrency.strategies.first
    threshold_strategy   = strategy.threshold.strategies.first

    expect(concurrency_strategy.limit(job_args)).to eq(7)
    expect(threshold_strategy.limit(job_args)).to  eq(11)
    expect(threshold_strategy.period(job_args)).to eq(2.minutes.to_f)
  end
end
