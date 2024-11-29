# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::ExportOccupations, type: :job do
  let(:assessment) { create(:assessment) }
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:user) { create(:user) }
  let!(:occupation1) { create(:occupation, name: 'Occupation1', dimension_id: assessment.dimension_id) }
  let!(:occupation2) { create(:occupation, name: 'Occupation2', dimension_id: assessment.dimension_id) }
  let!(:user_assessment) do
    create(
      :user_assessment,
      subject: user,
      assessment: assessment,
      campaign: campaign,
      completed_at: Time.zone.now,
      status: 2
    )
  end
  let!(:user_result) do
    create(
      :users_result,
      campaign: campaign,
      assessment: assessment,
      user_assessment: user_assessment,
      subject: user,
      occupations: [{ 'value' => 0.7, 'id' => occupation1.id }, { 'value' => 0.5, 'id' => occupation2.id }]
    )
  end
  let(:record) { create(:admin_job_record, data: { 'assessment_id' => assessment.id, 'campaign_id' => campaign.id }) }
  let(:job) { described_class.new(record) }

  describe '#headers' do
    it 'returns the correct headers for the CSV' do
      expect(job.headers).to include(
        AdminJobs::ExportOccupations::HEADER_COLUMNS +
        Occupation.pluck(:name) +
        AdminJobs::ExportOccupations::RANK_COLUMNS
      )
    end
  end

  describe '#data_row' do
    it 'returns a formatted row of data for csv' do
      row = job.records_for_export.first
      data_row = job.data_row(row)

      expect(data_row[0]).to eq(project.name)
      expect(data_row[1]).to eq(user.first_name)
      expect(data_row[2]).to eq(user.last_name)
      expect(data_row[3]).to eq(user.email)
      expect(data_row[4]).to eq(assessment.id)

      occupation_scores = row.occupations.map { |score| score['value'] }
      expect(data_row[AdminJobs::ExportOccupations::HEADER_COLUMNS.size, occupation_scores.size]).
        to eq(occupation_scores)
      expect(data_row.last(15)).to include('Occupation1', 0.7, 3, 'Occupation2', 0.5, 1)
    end
  end

  describe '#file_name' do
    it 'generates a valid filename' do
      file_name = job.file_name
      expect(file_name).to match(/^assessment-#{assessment.id}-occupations-\d{4}-\d{2}-\d{2}T\d{6}\.csv$/)
    end
  end

  describe '#generate_details' do
    it 'returns an array with translated label and file link' do
      allow(job).to receive(:file_link).and_return('link_to_file')
      expect(job.generate_details).to eq([[I18n.t('administration.navigation.occupations'), 'link_to_file']])
    end
  end
end
