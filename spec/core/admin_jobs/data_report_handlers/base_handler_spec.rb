# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::DataReportHandlers::BaseHandler do
  let(:test_handler_class) do
    Class.new(described_class) do
      def self.file_extension = 'csv'
    end
  end

  let(:allowed_country) { 'India' }
  let(:blocked_country) { 'Saudi Arabia' }

  let!(:restricted_project) { create(:project) }
  let!(:restricted_client)  { restricted_project.client }

  let!(:unrestricted_project) { create(:project) }
  let!(:unrestricted_client)  { unrestricted_project.client }

  let(:data_report) do
    create(
      :data_report,
      owner: restricted_client,
      configuration: { project_ids: [restricted_project.id, unrestricted_project.id] }.to_json
    )
  end

  def build_handler(user_country:)
    test_handler_class.new(
      data_report: data_report,
      data_report_job: nil,
      file_path: Rails.root.join('tmp', "spec_geo_#{SecureRandom.hex(4)}.csv"),
      runtime_configuration: nil,
      user_country: user_country
    )
  end

  before do
    restricted_client.update!(restricted_to_countries: [allowed_country])
    allow(Settings.features).to receive(:disable_geo_restriction).and_return(false)
  end

  describe '#geo_restricted_top_level_client_ids' do
    it 'returns [] when disable_geo_restriction is true' do
      allow(Settings.features).to receive(:disable_geo_restriction).and_return(true)

      expect(build_handler(user_country: blocked_country).send(:geo_restricted_top_level_client_ids)).to eq([])
    end

    it 'returns [] when user_country is blank' do
      expect(build_handler(user_country: nil).send(:geo_restricted_top_level_client_ids)).to eq([])
    end

    it 'includes the restricted client id when the country is not in its allow-list' do
      ids = build_handler(user_country: blocked_country).send(:geo_restricted_top_level_client_ids)

      expect(ids).to include(restricted_client.id)
    end

    it 'does not include a client with no restriction configured' do
      ids = build_handler(user_country: blocked_country).send(:geo_restricted_top_level_client_ids)

      expect(ids).not_to include(unrestricted_client.id)
    end

    it 'does not include the restricted client id when the country IS in its allow-list' do
      ids = build_handler(user_country: allowed_country).send(:geo_restricted_top_level_client_ids)

      expect(ids).not_to include(restricted_client.id)
    end
  end

  describe '#project_ids' do
    it 'still includes the unrestricted project when another client is blocked' do
      ids = build_handler(user_country: blocked_country).send(:project_ids)

      expect(ids).to include(unrestricted_project.id)
    end

    it 'includes the restricted project when the country is in its allow-list' do
      ids = build_handler(user_country: allowed_country).send(:project_ids)

      expect(ids).to include(restricted_project.id)
    end

    it 'returns everything unfiltered when user_country is blank' do
      ids = build_handler(user_country: nil).send(:project_ids)

      expect(ids).to contain_exactly(restricted_project.id, unrestricted_project.id)
    end

    it 'returns everything unfiltered when disable_geo_restriction is true' do
      allow(Settings.features).to receive(:disable_geo_restriction).and_return(true)
      ids = build_handler(user_country: blocked_country).send(:project_ids)

      expect(ids).to contain_exactly(restricted_project.id, unrestricted_project.id)
    end

    it 'returns config value unfiltered when project_ids is blank' do
      blank_report = create(:data_report, owner: restricted_client, configuration: {}.to_json)
      handler = test_handler_class.new(
        data_report: blank_report, data_report_job: nil,
        file_path: Rails.root.join('tmp', "spec_geo_blank_#{SecureRandom.hex(4)}.csv"),
        runtime_configuration: nil, user_country: blocked_country
      )

      expect(handler.send(:project_ids)).to be_blank
    end
  end
end
