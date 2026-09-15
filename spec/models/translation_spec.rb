# frozen_string_literal: true

require 'rails_helper'

describe Translation do
  describe 'touch behavior' do
    let(:report) { create(:report) }
    let(:page) { create(:page, report: report) }
    let(:report_module) { create(:module, page: page) }

    it 'touches the report when created for a report resource' do
      report.update_column(:updated_at, 1.day.ago)

      expect do
        create(:translation, resource: report, translateable: report_module)
      end.to(change { report.reload.updated_at })
    end

    it 'touches the report when updated for a report resource' do
      translation = create(:translation, resource: report, translateable: report_module)
      report.update_column(:updated_at, 1.day.ago)

      expect { translation.update!(props: '{"content":"updated"}') }.to(change { report.reload.updated_at })
    end

    it 'touches the report when destroyed for a report resource' do
      translation = create(:translation, resource: report, translateable: report_module)
      report.update_column(:updated_at, 1.day.ago)

      expect { translation.destroy }.to(change { report.reload.updated_at })
    end

    it 'does not touch the resource when resource is not a report' do
      snapshot = create(:reports_published_snapshot, report: report)
      snapshot.update_column(:updated_at, 1.day.ago)

      expect do
        create(:translation, resource: snapshot, translateable: report_module)
      end.not_to(change { snapshot.reload.updated_at })
    end
  end
end
