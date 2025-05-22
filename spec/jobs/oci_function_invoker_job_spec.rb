# frozen_string_literal: true

require 'rails_helper'

RSpec.describe OciFunctionInvokerJob, type: :job do
  let(:invoke_endpoint) { 'https://example.com/endpoint' }
  let(:payload) { 'hello_world' }
  let(:function_name) { 'test_function' }
  let(:options) { { function_name: function_name.to_sym } }
  let(:oci_service_instance) { instance_double(Faas::Services::Oci) }

  before do
    allow(Faas::Services::Oci).to receive(:new).and_return(oci_service_instance)
    clear_enqueued_jobs
    clear_performed_jobs
  end

  it 'calls invoke! on the service' do
    expect(oci_service_instance).to receive(:invoke!).with(payload)
    described_class.perform_now(function_name, invoke_endpoint, payload, options)
  end

  context 'when an IncorrectState error (409) occurs' do
    before do
      allow(oci_service_instance).to receive(:invoke!).and_raise(
        Faas::Services::Oci::Exceptions::IncorrectState
      )
    end

    it 'schedules the job for a retry' do
      expect do
        described_class.perform_now(function_name, invoke_endpoint, payload, options)
      end.to have_enqueued_job(OciFunctionInvokerJob).exactly(:once)
    end
  end

  context 'when a TooManyRequest error (429) occurs' do
    before do
      allow(oci_service_instance).to receive(:invoke!).and_raise(
        Faas::Services::Oci::Exceptions::TooManyRequest
      )
    end

    it 'schedules the job for a retry' do
      expect do
        described_class.perform_now(function_name, invoke_endpoint, payload, options)
      end.to have_enqueued_job(OciFunctionInvokerJob).exactly(:once)
    end
  end

  context 'when a non-retryable ServiceError occurs' do
    before do
      # 413 FunctionInvokeRequestContentTooLarge
      allow(oci_service_instance).to receive(:invoke!).and_raise(
        OCI::Errors::ServiceError.new(413, nil, nil, nil)
      )
    end

    it 'does not enqueue the job for a retry' do
      expect do
        described_class.perform_now(function_name, invoke_endpoint, payload, options)
      end.to raise_error(OCI::Errors::ServiceError)

      expect(enqueued_jobs).to be_empty
    end

    it 'raises the exception and creates the exception tracking record for job' do
      expect do
        described_class.perform_now(function_name, invoke_endpoint, payload, options)
      end.to raise_error(OCI::Errors::ServiceError)

      PlatformException.find_by(identifier: [OciFunctionInvokerJob.name, function_name].join('/')).tap do |tracker|
        expect(tracker).not_to be_nil
        expect(tracker.consecutive_failure_count).to eq(1)
      end
    end
  end
end
