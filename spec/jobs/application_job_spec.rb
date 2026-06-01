# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationJob, type: :job do
  context 'Job tracking concern' do
    # rubocop:disable Lint/ConstantDefinitionInBlock
    class SampleJobWithTracking < ApplicationJob
      track_job_run

      def perform; end
    end

    class SampleJobWithoutTracking < ApplicationJob
      def perform; end
    end
    # rubocop:enable Lint/ConstantDefinitionInBlock

    describe 'Job with job tracking enabled' do
      it 'creates last_job_run record on perform if it does not exist' do
        expect LastJobRun.find_by(name: SampleJobWithTracking.name).nil?

        expect do
          SampleJobWithTracking.perform_now
        end.to change(LastJobRun, :count).by(1)

        last_job_run_record = LastJobRun.find_by(name: SampleJobWithTracking.name)

        expect last_job_run_record.present?
        expect(last_job_run_record.started_at).to be_within(1.second).of(Time.zone.now)
      end

      it 'updates last_job_run record on perform if the record exists' do
        job_run_record = create(:last_job_run, :completed_yesterday, name: SampleJobWithTracking.name)

        expect(job_run_record.started_at).to be_within(1.second).of(1.day.ago)

        expect do
          SampleJobWithTracking.perform_now
        end.to change(LastJobRun, :count).by(0)

        expect(job_run_record.reload.started_at).to be_within(1.second).of(Time.zone.now)
        expect(job_run_record.reload.updated_at).to be_within(1.second).of(Time.zone.now)
      end
    end

    describe 'Job without job tracking enabled' do
      it 'does not create last_job_run record on perform' do
        expect do
          SampleJobWithoutTracking.perform_now
        end.to change(LastJobRun, :count).by(0)

        expect LastJobRun.find_by(name: SampleJobWithoutTracking.name).nil?
      end
    end
  end

  context 'ControlException concern' do
    # rubocop:disable Lint/ConstantDefinitionInBlock

    class JobPerformError < StandardError
    end

    class SampleJobWithExceptionTracking < ApplicationJob
      track_exceptions exception_classes: [StandardError]

      def perform(pause_exception: false)
        raise JobPerformError unless pause_exception
      end
    end

    class SampleJobWithoutExceptionTracking < ApplicationJob
      def perform
        raise JobPerformError
      end
    end
    # rubocop:enable Lint/ConstantDefinitionInBlock

    describe 'job without exception control tracking' do
      it 'does not controls the raised exception' do
        (ApplicationJob::DEFAULT_SUPPRESSION_THRESHOLD + 1).times do
          expect { SampleJobWithoutExceptionTracking.perform_now }.to raise_exception(JobPerformError)
        end

        expect(PlatformException.count).to eq(0)
      end
    end

    describe 'job with exception tracking' do
      let(:capture_logger) { SemanticLogger::Test::CaptureLogEvents.new }

      it 'raises the exception and creates the exception tracking record for job without any record' do
        ApplicationJob::DEFAULT_SUPPRESSION_THRESHOLD.times do
          expect { SampleJobWithExceptionTracking.perform_now }.to raise_exception(JobPerformError)
        end

        PlatformException.find_by(identifier: SampleJobWithExceptionTracking.name).tap do |tracker|
          expect(tracker).not_to be_nil
          expect(tracker.consecutive_failure_count).to eq(ApplicationJob::DEFAULT_SUPPRESSION_THRESHOLD)
          expect(tracker.meta).not_to be_empty
          expect(tracker.consecutive_failure_count).to eq(ApplicationJob::DEFAULT_SUPPRESSION_THRESHOLD)
        end
      end

      it 'does not raise job exception when threshold is hit' do
        ApplicationJob::DEFAULT_SUPPRESSION_THRESHOLD.times do
          expect { SampleJobWithExceptionTracking.perform_now }.to raise_exception(JobPerformError)
        end

        PlatformException.find_by(identifier: SampleJobWithExceptionTracking.name).tap do |tracker|
          expect(tracker.consecutive_failure_count).to eq(ApplicationJob::DEFAULT_SUPPRESSION_THRESHOLD)
        end

        expect { SampleJobWithExceptionTracking.perform_now }.not_to raise_exception
      end

      it 'logs the SuppressedExceptionError message after threshold' do
        ApplicationJob::DEFAULT_SUPPRESSION_THRESHOLD.times do
          expect { SampleJobWithExceptionTracking.perform_now }.to raise_exception(JobPerformError)
        end

        PlatformException.find_by(identifier: SampleJobWithExceptionTracking.name).tap do |tracker|
          expect(tracker.consecutive_failure_count).to eq(ApplicationJob::DEFAULT_SUPPRESSION_THRESHOLD)
        end

        allow_any_instance_of(SampleJobWithExceptionTracking).to receive(:logger).and_return(capture_logger)

        error = JobPerformError.new

        expect { SampleJobWithExceptionTracking.perform_now }.not_to raise_exception
        expect(capture_logger.events.last.message).to include(
          "Platform exception discarded #{error.class} due to a #{SuppressedExceptionError}." \
          "The original exception was #{error.inspect}."
        )
        expect(capture_logger.events.last.level).to eq(:error)
      end

      it 'resets the failure count after successful run' do
        exception_record = create(:platform_exception,
                                  identifier: SampleJobWithExceptionTracking.name,
                                  consecutive_failure_count: 2)

        expect { SampleJobWithExceptionTracking.perform_now(pause_exception: true) }.not_to raise_exception

        expect(exception_record.reload.consecutive_failure_count).to eq(0)
      end
    end
  end

  context 'tenant propagation and scoping' do
    # rubocop:disable Lint/ConstantDefinitionInBlock
    class TenantScopedReadJob < ApplicationJob
      cattr_accessor :campaign_ids_seen

      def perform
        self.class.campaign_ids_seen = Campaign.order(:id).pluck(:id)
      end
    end
    # rubocop:enable Lint/ConstantDefinitionInBlock

    let(:tenant_a) { create(:tenancy) }
    let(:tenant_b) { create(:tenancy) }
    let(:project_a) { create(:project, parent: tenant_a) }
    let(:project_b) { create(:project, parent: tenant_b) }
    let!(:campaign_a) { create(:campaign, project: project_a) }
    let!(:campaign_b) { create(:campaign, project: project_b) }

    before do
      TenantScopedReadJob.campaign_ids_seen = nil
    end

    it 'scopes job queries when run with current tenant' do
      ActsAsTenant.with_tenant(tenant_a) do
        TenantScopedReadJob.perform_now
      end

      expect(TenantScopedReadJob.campaign_ids_seen).to contain_exactly(campaign_a.id)
    end

    it 'propagates tenant through Sidekiq middleware payload and scopes within server middleware' do
      message = {}

      ActsAsTenant.with_tenant(tenant_a) do
        ActsAsTenant::Sidekiq::Client.new.call(nil, message, nil, nil) { nil }
      end

      expect(message.dig('acts_as_tenant', 'class')).to eq('Client')
      expect(message.dig('acts_as_tenant', 'id')).to eq(tenant_a.id)

      seen_ids = nil
      ActsAsTenant::Sidekiq::Server.new.call(nil, message, nil) do
        seen_ids = Campaign.order(:id).pluck(:id)
      end

      expect(seen_ids).to contain_exactly(campaign_a.id)
    end
  end
end
