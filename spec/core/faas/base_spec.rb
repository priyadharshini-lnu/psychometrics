# frozen_string_literal: true

require 'rails_helper'

class TestCloudFunction < Faas::Base
  def call
    make_request
  end

  private

  def function_name
    :test_function
  end

  def request_body
    { test: 'data' }
  end
end

describe Faas::Base do
  let(:function_name) { :test_function }
  let(:options) { { body: { data: 'test' }, function_name: function_name } }
  let(:mock_signing_secret) { 'test-secret' }
  let(:aws_function_details) { { 'aws_key' => 'test:key', 'aws_secret' => 'test-secret' } }
  let(:oci_function_details) { { 'oci_key' => 'oci-test-key', 'endpoint' => 'oci-endpoint' } }
  let(:cloud_function_instance) { TestCloudFunction.new(options) }

  describe '#call' do
    context 'When service provider is set to aws' do
      let(:mock_aws_service) { instance_double(Faas::Services::Aws) }

      before do
        allow(Settings).to receive(:cloud_functions_service).and_return('aws')
        allow(Settings).to receive_message_chain(:secrets, :faas).
          and_return({ signing_secret: mock_signing_secret })
        allow(Settings).to receive_message_chain(:secrets, :aws, :dig).
          with(:lambda, :test_function).
          and_return(aws_function_details)
        allow(Faas::Services::Aws).to receive(:new).and_return(mock_aws_service)
        allow(mock_aws_service).to receive(:call)
      end

      it 'calls the Faas::Services::Aws service with aws_function_details' do
        expect(Faas::Services::Aws).to receive(:new).
          with(aws_function_details, options).
          and_return(mock_aws_service)
        expect(mock_aws_service).to receive(:call)
        cloud_function_instance.call
      end
    end

    context 'When service provider is set to oci' do
      let(:mock_oci_service) { instance_double(Faas::Services::Oci) }

      before do
        allow(Settings).to receive(:cloud_functions_service).and_return('oci')
        allow(Settings).to receive_message_chain(:secrets, :faas).
          and_return({ signing_secret: mock_signing_secret })
        allow(Settings).to receive_message_chain(:secrets, :oci, :dig).
          with(:functions, :test_function).
          and_return(oci_function_details)
        allow_any_instance_of(Faas::Services::Oci).to receive(:invoke!).and_return('Func response')
      end

      it 'calls the Faas::Services::Oci service with oci_function_details' do
        expect(Faas::Services::Oci).to receive(:new).
          with(oci_function_details, options).
          and_call_original
        expect_any_instance_of(Faas::Services::Oci).to receive(:call).and_call_original
        cloud_function_instance.call
      end

      it 'schedules OciFunctionInvokerJob when call' do
        expect do
          cloud_function_instance.call
        end.to have_enqueued_job(OciFunctionInvokerJob).with(function_name.to_s, oci_function_details, anything,
                                                             options)
      end
    end

    context 'When service provider is not configured' do
      before do
        allow(Settings).to receive(:cloud_functions_service).and_return(nil)
        allow(Settings).to receive_message_chain(:secrets, :faas).
          and_return({ signing_secret: mock_signing_secret })
      end

      it 'throws a ServiceNotConfiguredError' do
        expect { cloud_function_instance.call }.to raise_error(
          Faas::Base::ServiceNotConfiguredError,
          'CLOUD_FUNCTION_SERVICE provider is not configured'
        )
      end
    end

    context 'When service provider is not available' do
      before do
        allow(Settings).to receive(:cloud_functions_service).and_return('invalid')
        allow(Settings).to receive_message_chain(:secrets, :faas).
          and_return({ signing_secret: mock_signing_secret })
      end

      it 'throws a UnsupportedServiceError' do
        expect { cloud_function_instance.call }.to raise_error(
          Faas::Base::UnsupportedServiceError,
          'Unsupported service: invalid. Supported services are: [:aws, :oci]'
        )
      end
    end

    context 'When function_name is not defined' do
      let(:invalid_class) do
        Class.new(Faas::Base) do
          def call
            make_request
          end
        end
      end
      let(:cloud_function_instance) { invalid_class.new(options) }

      before do
        allow(Settings).to receive(:cloud_functions_service).and_return('aws')
      end

      it 'raises an error' do
        expect { cloud_function_instance.call }.to raise_error(
          RuntimeError,
          /Define function_name in/
        )
      end
    end
  end
end
