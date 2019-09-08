# frozen_string_literal: true

require 'rails_helper'

describe Administration::RegenerateReports do
  let(:client) { build_stubbed(:client) }
  let(:current_user) { build_stubbed(:user) }

  context 'form is invalid' do
    let(:form) { double('form', 'invalid?': true, report_ids: []) }
    subject { described_class.call(form, current_user, client) }

    it 'broadcast :invalid' do
      expect { subject }.to broadcast(:invalid)
    end

    it 'dont broadcast :ok' do
      expect { subject }.not_to broadcast(:ok)
    end

    it 'dont run background job' do
      expect(::Reports::BulkExportJob).not_to receive(:perform_later)
      subject
    end
  end

  context 'form is valid' do
    let(:form) { double('form', 'invalid?': false, report_ids: []) }
    subject { described_class.call(form, current_user, client) }

    it 'broadcast :ok' do
      expect { subject }.to broadcast(:ok)
    end

    it 'dont broadcast :invalid' do
      expect { subject }.not_to broadcast(:invalid)
    end

    it 'run background job' do
      expect(::Reports::BulkExportJob).to receive(:perform_later).with(form.report_ids, current_user, client)
      subject
    end
  end
end
