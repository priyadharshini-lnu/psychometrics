# frozen_string_literal: true

require 'rails_helper'

describe Reports::PublishedReader do
  let(:report)  { create(:report) }
  let!(:page)   { create(:page, report: report) }
  let!(:module1) { create(:module, page: page) }
  let!(:module2) { create(:module, page: page) }
  let!(:filter) { create(:filter, report: report) }

  let(:serializer_context) do
    {
      piped_text_context: nil,
      module_overrides: [],
      user_results: []
    }
  end

  it 'produces identical serializer output for the live report and a PublishedReport built from snapshot data' do
    report_with_associations = Report.includes(pages: :modules).find(report.id)

    live_json = JSON.parse(
      ReportSerializer.new(context: serializer_context).serialize(report_with_associations).to_json
    )

    Reports::PublishedSnapshot.create!(
      report:       report_with_associations,
      data:         Reports::BuildSnapshotData.call!(report_with_associations),
      published_at: Time.current
    )

    view      = Reports::PublishedReader.new(report_with_associations.reload)
    view_json = JSON.parse(ReportSerializer.new(context: serializer_context).serialize(view).to_json)

    expect(view_json).to eq(live_json)
  end

  describe 'live-owned metadata delegates to the current report, not the frozen snapshot' do
    let!(:snapshot) do
      Reports::PublishedSnapshot.create!(
        report:       report,
        data:         Reports::BuildSnapshotData.call!(report),
        published_at: Time.current
      )
    end

    it 'decorate reads the live report, fixing the PDF NoMethodError' do
      report.update!(name: 'Updated Name')
      view = Reports::PublishedReader.new(report.reload)

      expect(view.decorate.display_name).to eq('Updated Name')
    end

    it 'description reads the live report description' do
      report.update!(description: 'Updated description')
      view = Reports::PublishedReader.new(report.reload)

      expect(view.description).to eq('Updated description')
    end

    it 'data_only? reads the live report flag' do
      report.update!(data_only: true)
      view = Reports::PublishedReader.new(report.reload)

      expect(view.data_only?).to be true
    end

    it 'icon and poster delegate to the live report attachments' do
      view = Reports::PublishedReader.new(report.reload)

      expect(view.icon).to eq(report.icon)
      expect(view.poster).to eq(report.poster)
    end
  end

  describe '#modules_empty?' do
    it 'returns true when the snapshot predates modules added to the draft afterwards' do
      empty_report = create(:report)
      Reports::PublishedSnapshot.create!(
        report:       empty_report,
        data:         Reports::BuildSnapshotData.call!(empty_report),
        published_at: Time.current
      )
      create(:module, page: create(:page, report: empty_report))

      view = Reports::PublishedReader.new(empty_report.reload)

      expect(view.modules_empty?).to be true
    end

    it 'returns false when the snapshot has modules even after the draft modules are removed' do
      Reports::PublishedSnapshot.create!(
        report:       report,
        data:         Reports::BuildSnapshotData.call!(report),
        published_at: Time.current
      )
      module1.destroy
      module2.destroy

      view = Reports::PublishedReader.new(report.reload)

      expect(view.modules_empty?).to be false
    end
  end

  describe 'DataConfigurationDerived reads from the frozen snapshot, not the live report' do
    let(:data_config) do
      {
        'sections' => [
          {
            'data' => [
              { 'type' => 'normed_factor', 'factorId' => 99, 'assessmentId' => 'a1' },
              { 'type' => 'ranked_occupations' }
            ]
          }
        ]
      }
    end

    let!(:snapshot) do
      Reports::PublishedSnapshot.create!(
        report:       report,
        data:         Reports::BuildSnapshotData.call!(report).merge(
          'report' => Reports::BuildSnapshotData.call!(report)['report'].merge(
            'data_configuration' => data_config,
            'props'              => { 'sizes' => { 'height' => 827, 'width' => 700 } }
          )
        ),
        published_at: Time.current
      )
    end

    subject(:view) { Reports::PublishedReader.new(report.reload) }

    it 'flat_data_configuration returns entries from the snapshot' do
      expect(view.flat_data_configuration.pluck('type')).to match_array(%w[normed_factor ranked_occupations])
    end

    it 'data_configuration_factor_ids reads factor ids from the snapshot' do
      expect(view.data_configuration_factor_ids).to eq([99])
    end

    it 'data_configuration_assessment_ids reads assessment ids from the snapshot' do
      expect(view.data_configuration_assessment_ids).to eq(['a1'])
    end

    it 'has_data_configuration_occupations? reads from the snapshot' do
      expect(view.has_data_configuration_occupations?).to be true
    end

    it 'pdf_dimension reads sizes from the snapshot props' do
      expect(view.pdf_dimension).to eq({ width: '700px', height: '828px' })
    end
  end
end
