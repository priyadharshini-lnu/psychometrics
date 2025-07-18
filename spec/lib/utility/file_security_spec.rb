# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Utility::FileSecurity do
  describe '.safe_file_path?' do
    let(:allowed_dir) { '/tmp/safe_directory' }

    context 'when file path is within allowed directory' do
      it 'returns true for direct file in allowed directory' do
        file_path = '/tmp/safe_directory/file.pdf'
        expect(described_class.safe_file_path?(file_path, allowed_dir)).to be true
      end

      it 'returns true for file in subdirectory of allowed directory' do
        file_path = '/tmp/safe_directory/subfolder/file.pdf'
        expect(described_class.safe_file_path?(file_path, allowed_dir)).to be true
      end
    end

    context 'when file path is outside allowed directory' do
      it 'returns false for file in different directory' do
        file_path = '/tmp/other_directory/file.pdf'
        expect(described_class.safe_file_path?(file_path, allowed_dir)).to be false
      end

      it 'returns false for path traversal attempts' do
        file_path = '/tmp/safe_directory/../../../etc/passwd'
        expect(described_class.safe_file_path?(file_path, allowed_dir)).to be false
      end

      it 'returns false for relative path traversal' do
        file_path = '/tmp/safe_directory/../other_directory/file.pdf'
        expect(described_class.safe_file_path?(file_path, allowed_dir)).to be false
      end
    end

    context 'with edge cases' do
      it 'returns false when file_path is blank' do
        expect(described_class.safe_file_path?('', allowed_dir)).to be false
        expect(described_class.safe_file_path?(nil, allowed_dir)).to be false
      end

      it 'returns false when allowed_dir is blank' do
        expect(described_class.safe_file_path?('/tmp/file.pdf', '')).to be false
        expect(described_class.safe_file_path?('/tmp/file.pdf', nil)).to be false
      end
    end
  end

  describe '.safe_send_file' do
    let(:controller) { double('controller') }
    let(:file_path) { '/tmp/safe_directory/file.pdf' }
    let(:allowed_dir) { '/tmp/safe_directory' }
    let(:send_options) { { type: 'application/pdf', disposition: 'attachment' } }

    context 'when file path is safe' do
      before do
        allow(described_class).to receive(:safe_file_path?).with(file_path, allowed_dir).and_return(true)
      end

      it 'sends the file and returns true' do
        expect(controller).to receive(:send_file).with(file_path, **send_options)

        result = described_class.safe_send_file(controller, file_path, allowed_dir, **send_options)
        expect(result).to be true
      end
    end

    context 'when file path is unsafe' do
      before do
        allow(described_class).to receive(:safe_file_path?).with(file_path, allowed_dir).and_return(false)
      end

      it 'returns forbidden response and returns false' do
        expect(controller).to receive(:head).with(:forbidden)
        expect(controller).not_to receive(:send_file)

        result = described_class.safe_send_file(controller, file_path, allowed_dir, **send_options)
        expect(result).to be false
      end
    end
  end
end
