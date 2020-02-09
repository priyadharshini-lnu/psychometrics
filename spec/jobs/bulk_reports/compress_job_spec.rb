# frozen_string_literal: true

require 'rails_helper'

describe BulkReports::CompressJob do
  let(:report) { build_stubbed(:bulk_report) }
  let(:compressor) { double('compressor') }

  describe '#perform' do
    let(:output_dir) { Rails.root.join('tmp', 'bulk_reports', "compressed_#{report.id}").to_s }

    it 'creates output folder for compressed files' do
      expect(Compressor).to receive(:new).and_return(compressor)

      expect(compressor).to receive(:process)
      expect_any_instance_of(described_class).to receive(:add_files_to_bulk_report)
      expect_any_instance_of(described_class).to receive(:clean)

      described_class.perform_now(report)
    end
  end
end
