# frozen_string_literal: true

require 'rails_helper'

describe Reports::PublishSnapshot do
  let(:report)    { create(:report) }
  let(:publisher) { create(:user) }
  let!(:page)     { create(:page, report: report) }
  let!(:mod)      { create(:module, page: page) }

  describe '#call' do
    it 'creates a published snapshot for the report' do
      expect do
        described_class.call!(report, publisher)
      end.to change { Reports::PublishedSnapshot.count }.by(1)

      snapshot = report.reload.published_snapshot
      expect(snapshot).to have_attributes(
        report_id:    report.id,
        published_by: publisher,
        published_at: be_present
      )
    end

    it 'stores the report design in the snapshot data' do
      described_class.call!(report, publisher)

      data = report.reload.published_snapshot.data
      expect(data['pages'].length).to eq(1)
      expect(data['pages'].first['modules'].length).to eq(1)
    end

    it 'upserts on republish — same snapshot row, updated published_at' do
      described_class.call!(report, publisher)
      first_id        = report.reload.published_snapshot.id
      first_published = report.published_snapshot.published_at

      Timecop.freeze(1.minute.from_now) do
        described_class.call!(report, publisher)
      end

      expect(Reports::PublishedSnapshot.where(report_id: report.id).count).to eq(1)
      snapshot = report.reload.published_snapshot
      expect(snapshot.id).to eq(first_id)
      expect(snapshot.published_at).to be > first_published
    end

    context 'when the report has translations' do
      let(:other_mod) { create(:module, page: page) }
      let!(:translation_ar) do
        create(:translation, resource: report, translateable: mod,
                             locale: 'ar', props: { text: 'مرحبا' })
      end
      let!(:translation_fr) do
        create(:translation, resource: report, translateable: other_mod,
                             locale: 'fr', props: { text: 'Bonjour' })
      end

      it 'copies all report translations to the snapshot' do
        described_class.call!(report, publisher)

        snapshot = report.reload.published_snapshot
        snapshot_translations = Translation.for_snapshot(snapshot.id)

        expect(snapshot_translations.count).to eq(2)
        expect(snapshot_translations.pluck(:locale)).to match_array(%w[ar fr])
        expect(snapshot_translations.pluck(:translateable_id)).to match_array([mod.id, other_mod.id])
      end

      it 'replaces snapshot translations on republish' do
        described_class.call!(report, publisher)

        create(:translation, resource: report, translateable: mod,
                             locale: 'de', props: { text: 'Hallo' })

        described_class.call!(report, publisher)

        snapshot = report.reload.published_snapshot
        expect(Translation.for_snapshot(snapshot.id).pluck(:locale)).to match_array(%w[ar fr de])
      end

      it 'does not accumulate duplicate snapshot translations on repeated publishes' do
        3.times { described_class.call!(report, publisher) }

        snapshot = report.reload.published_snapshot
        expect(Translation.for_snapshot(snapshot.id).count).to eq(2)
      end
    end

    it 'marks the report as published' do
      expect { described_class.call!(report, publisher) }.
        to change { report.reload.published? }.from(false).to(true)
    end

    context 'when soft-deleted modules exist' do
      let!(:removed_mod) { create(:module, page: page).tap(&:mark_removed!) }

      it 'removes soft-deleted modules from the database' do
        expect { described_class.call!(report, publisher) }.
          to change { Reports::Module.unscoped.where(id: removed_mod.id).count }.from(1).to(0)
      end

      it 'excludes soft-deleted modules from the snapshot data' do
        described_class.call!(report, publisher)

        snapshot_module_ids = report.reload.published_snapshot.data['pages'].
                              flat_map { |p| p['modules'].map { |m| m['id'] } }
        expect(snapshot_module_ids).not_to include(removed_mod.id)
      end

      it 'cascades deletion to user report comments on the purged module' do
        user_report = create(:user_report, report: report)
        comment     = create(:user_report_comment, user_report: user_report, reports_module: removed_mod)

        described_class.call!(report, publisher)

        expect(UserReportComment.find_by(id: comment.id)).to be_nil
      end

      it 'destroys text module overrides on the purged module' do
        override = create(:text_module_override, module_id: removed_mod.id)

        described_class.call!(report, publisher)

        expect(TextModuleOverride.find_by(id: override.id)).to be_nil
      end
    end

    context 'when a soft-deleted page exists' do
      let!(:removed_page) { create(:page, report: report).tap(&:mark_removed!) }

      it 'physically removes the soft-deleted page' do
        expect { described_class.call!(report, publisher) }.
          to change { Reports::Page.unscoped.where(id: removed_page.id).count }.from(1).to(0)
      end

      it 'excludes the soft-deleted page from the snapshot data' do
        described_class.call!(report, publisher)

        snapshot_page_ids = report.reload.published_snapshot.data['pages'].pluck('id')
        expect(snapshot_page_ids).not_to include(removed_page.id)
      end
    end
  end
end
