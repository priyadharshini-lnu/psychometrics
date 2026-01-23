# frozen_string_literal: true

require 'rails_helper'
require 'semantic_logger_initializer'

RSpec.describe SemanticLoggerInitializer do
  describe '.setup_appenders' do
    let(:mock_appender) { instance_double(SemanticLogger::Appender::IO) }
    let(:other_appender) { instance_double(SemanticLogger::Appender::File) }

    before do
      allow(SemanticLogger).to receive(:appenders).and_return([mock_appender, other_appender])
      allow(SemanticLogger).to receive(:remove_appender)
      allow(SemanticLogger).to receive(:add_appender)
      allow(mock_appender).to receive(:is_a?).with(SemanticLogger::Appender::IO).and_return(true)
      allow(other_appender).to receive(:is_a?).with(SemanticLogger::Appender::IO).and_return(false)

      allow(Settings).to receive(:features).and_return(double(rails_log_to_json: false))
    end

    it 'removes existing IO appenders' do
      expect(SemanticLogger).to receive(:remove_appender).with(mock_appender)
      described_class.send(:setup_appenders)
    end

    it 'does not remove non-IO appenders' do
      expect(SemanticLogger).not_to receive(:remove_appender).with(other_appender)
      described_class.send(:setup_appenders)
    end

    context 'when rails_log_to_json is true' do
      before do
        allow(Settings.features).to receive(:rails_log_to_json).and_return(true)
      end

      it 'uses SiemLogger::Formatter' do
        expect(SemanticLogger).to receive(:add_appender).with(hash_including(formatter: instance_of(SiemLogger::Formatter)))
        described_class.send(:setup_appenders)
      end
    end

    context 'when rails_log_to_json is false' do
      before do
        allow(Settings.features).to receive(:rails_log_to_json).and_return(false)
      end

      it 'uses :color formatter' do
        expect(SemanticLogger).to receive(:add_appender).with(hash_including(formatter: :color))
        described_class.send(:setup_appenders)
      end
    end

    context 'environment configuration' do
      context 'in test environment' do
        before do
          allow(Rails).to receive(:env).and_return(ActiveSupport::StringInquirer.new('test'))
        end

        it 'adds file appender' do
          expect(SemanticLogger).to receive(:add_appender).with(hash_including(file_name: 'log/test.log'))
          described_class.send(:setup_appenders)
        end

        it 'does not add stdout appender' do
          expect(SemanticLogger).not_to receive(:add_appender).with(hash_including(io: $stdout))
          described_class.send(:setup_appenders)
        end
      end

      context 'in development environment' do
        before do
          allow(Rails).to receive(:env).and_return(ActiveSupport::StringInquirer.new('development'))
        end

        it 'adds file appender' do
          expect(SemanticLogger).to receive(:add_appender).with(hash_including(file_name: 'log/development.log'))
          described_class.send(:setup_appenders)
        end

        it 'adds stdout appender' do
          expect(SemanticLogger).to receive(:add_appender).with(hash_including(io: $stdout))
          described_class.send(:setup_appenders)
        end
      end

      context 'in production environment' do
        before do
          allow(Rails).to receive(:env).and_return(ActiveSupport::StringInquirer.new('production'))
        end

        it 'adds stdout appender' do
          expect(SemanticLogger).to receive(:add_appender).with(hash_including(io: $stdout))
          described_class.send(:setup_appenders)
        end

        it 'does not add file appender' do
          expect(SemanticLogger).not_to receive(:add_appender).with(hash_including(file_name: anything))
          described_class.send(:setup_appenders)
        end
      end
    end
  end
end
