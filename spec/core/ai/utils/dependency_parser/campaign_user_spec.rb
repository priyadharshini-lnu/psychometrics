# frozen_string_literal: true

require 'rails_helper'

describe AI::Utils::DependencyParser::CampaignUser do
  let(:current_job_role) do
    create(:job_role, name: 'Software Engineer', code: 'swe',
   description: 'A software engineer responsible for developing applications')
  end
  let(:target_job_role) do
    create(:job_role, name: 'Senior Software Engineer', code: 'senior_swe',
   description: 'A senior software engineer with leadership responsibilities')
  end
  let(:user) { create(:user) }
  let(:campaign) { create(:campaign) }
  let(:campaign_user) do
    create(:campaign_user, user: user, campaign: campaign, current_job_role: current_job_role,
   target_job_role: target_job_role)
  end

  subject { described_class.new(campaign_user) }

  describe '#parse' do
    context 'when campaign user has both current and target job roles' do
      it 'returns XML with both job roles' do
        result = subject.parse

        expect(result).to include('<current_job_role>')
        expect(result).to include('<target_job_role>')
        expect(result).to include('<name>Software Engineer</name>')
        expect(result).to include('<name>Senior Software Engineer</name>')
        expect(result).to include('<code>swe</code>')
        expect(result).to include('<code>senior_swe</code>')
        expect(result).to include(
          '<description>A software engineer responsible for developing applications</description>'
        )
        expect(result).to include(
          '<description>A senior software engineer with leadership responsibilities</description>'
        )
      end

      it 'includes the complete XML structure' do
        result = subject.parse

        expected_structure = <<~XML.strip
          <current_job_role>
            <name>Software Engineer</name>
          <description>A software engineer responsible for developing applications</description>
          <code>swe</code>

          </current_job_role>
          <target_job_role>
            <name>Senior Software Engineer</name>
          <description>A senior software engineer with leadership responsibilities</description>
          <code>senior_swe</code>

          </target_job_role>
          </campaign_user>
        XML

        expect(result.strip).to eq(expected_structure)
      end
    end

    context 'when campaign user has no current job role' do
      let(:campaign_user) do
        create(:campaign_user, user: user, campaign: campaign, current_job_role: nil, target_job_role: target_job_role)
      end

      it 'returns empty current_job_role section' do
        result = subject.parse

        expect(result).to include('<current_job_role>')
        expect(result).to include('</current_job_role>')
        expect(result).not_to include('<name>Software Engineer</name>')
        expect(result).to include('<name>Senior Software Engineer</name>')
      end
    end

    context 'when campaign user has no target job role' do
      let(:campaign_user) do
        create(:campaign_user, user: user, campaign: campaign, current_job_role: current_job_role, target_job_role: nil)
      end

      it 'returns empty target_job_role section' do
        result = subject.parse

        expect(result).to include('<target_job_role>')
        expect(result).to include('</target_job_role>')
        expect(result).to include('<name>Software Engineer</name>')
        expect(result).not_to include('<name>Senior Software Engineer</name>')
      end
    end

    context 'when campaign user has no job roles' do
      let(:campaign_user) do
        create(:campaign_user, user: user, campaign: campaign, current_job_role: nil, target_job_role: nil)
      end

      it 'returns empty job role sections' do
        result = subject.parse

        expect(result).to include('<current_job_role>')
        expect(result).to include('</current_job_role>')
        expect(result).to include('<target_job_role>')
        expect(result).to include('</target_job_role>')
        expect(result).not_to include('<name>')
        expect(result).not_to include('<code>')
        expect(result).not_to include('<description>')
      end
    end

    context 'when job role has long description' do
      let(:long_description) do
        'long description' * 100
      end
      let(:long_desc_job_role) { create(:job_role, name: 'Test Role', code: 'test', description: long_description) }
      let(:campaign_user) do
        create(:campaign_user, user: user, campaign: campaign, current_job_role: long_desc_job_role,
target_job_role: nil)
      end

      it 'truncates description to 50 words' do
        result = subject.parse

        expect(result).to include('...')
        # Count words in the description part
        description_match = result.match(%r{<description>(.*?)</description>})
        expect(description_match).not_to be_nil

        description_text = description_match[1]
        word_count = description_text.gsub('...', '').split.count
        expect(word_count).to eq(50)
      end
    end
  end
end
