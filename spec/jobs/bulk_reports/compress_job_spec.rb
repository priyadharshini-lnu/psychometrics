# frozen_string_literal: true

require 'rails_helper'

describe BulkReports::CompressJob do
  let(:report) { build_stubbed(:bulk_report) }
  let(:zip_file) { double('zip_file') }

  describe '#perform' do
    it 'creates zip file' do
      expect(Dir).to receive(:mktmpdir).and_yield('dir')

      expect(ZipFileGenerator).to receive(:new).and_return(zip_file)
      expect(zip_file).to receive(:write)
      expect_any_instance_of(described_class).to receive(:save_report_with_file)
      described_class.perform_now(report)
    end
  end
end
