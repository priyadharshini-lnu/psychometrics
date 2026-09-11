# frozen_string_literal: true

require 'rails_helper'

# Base class enforces the interface that both readers must implements.
# The idea is to ensure that Report and Reports::PublishedSnapshot are interchangeable
# and that the rest of the code can work with either one without knowing which it was handed.
describe Reports::BaseReader do
  let(:current_user) { create(:superadmin) }
  let(:report) { create(:report) }
  let!(:page) { create(:page, report: report) }
  let!(:report_module) { create(:module, page: page) }

  let(:readers) do
    [Reports::DraftReader, Reports::PublishedReader]
  end

  before { Reports::PublishSnapshot.call!(report, current_user) }

  it 'declares every reader a consumer may call' do
    expect(described_class.interface).to match_array(
      %i[
        id name description disabled category category_threesixty?
        assessment_ids assessments dimension_ids factors_aliases
        created_at updated_at default_language other_languages
        published_snapshot decorate icon poster data_only?
        props styles data_configuration data_sheet_columns external_settings
        pages filters campaign_factors campaign_ai_artifacts modules_empty?
        translation_scope
        flat_data_configuration has_data_configuration_occupations?
        data_configuration_factor_ids data_configuration_assessment_ids pdf_dimension
      ]
    )
  end

  it 'leaves no declared reader unimplemented by either version' do
    unimplemented = readers.flat_map do |klass|
      instance = klass.new(report.reload)

      described_class.interface.
        select { |reader| raises_not_implemented?(instance, reader) }.
        map { |reader| "#{klass}##{reader}" }
    end

    expect(unimplemented).to be_empty
  end

  it 'keeps the two readers interchangeable by holding them to one public surface' do
    draft, published = readers.map { |klass| (klass.instance_methods - Object.instance_methods).sort }

    expect(draft).to eq(published)
  end

  def raises_not_implemented?(instance, reader)
    instance.public_send(reader)
    false
  rescue NotImplementedError
    true
  rescue StandardError
    false
  end
end
