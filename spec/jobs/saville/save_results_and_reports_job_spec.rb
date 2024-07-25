# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Saville::SaveResultsAndReportsJob, type: :job do
  let(:score_response) do
    %(
        <AssessmentResult>
          <ReceiptId>
            <IdValue>#{saville_user_assessment.request_id}</IdValue>
          </ReceiptId>
          <Results>
            <SupportingMaterials>
              <Id><IdValue>#{report.external_report_id}</IdValue></Id>
              <EmbeddedData>
                <EncodedContent>#{file_fixture('base64pdf.txt').read}</EncodedContent>
              </EmbeddedData>
            </SupportingMaterials>
            <DetailResult>
              <Description>Ratings Acquiescence</Description>
                <CompetencyAssessed>
                  <CompetencyId idOwner="Saville Consulting">
                    <IdValue name="Reference">WAVEFS_RATACQ</IdValue>
                    <IdValue name="Type">Normative</IdValue>
                  </CompetencyId>
                </CompetencyAssessed>
              <Score type="sten">1</Score>
            </DetailResult>
            <DetailResult>
              <Description>Consistency of Rankings</Description>
              <CompetencyAssessed>
                <CompetencyId idOwner="Saville Consulting">
                  <IdValue name="Reference">WAVEFS_CONRANK</IdValue>
                  <IdValue name="Type">Ipsative</IdValue>
                </CompetencyId>
              </CompetencyAssessed>
              <Score type='Percentile'>2.0</Score>
            </DetailResult>
          </Results>
        </AssessmentResult>
      )
  end

  describe 'saville assessment is not present' do
    it "doesn't raise exeception if SavilleUserAssessment is not found with particular receipt_id" do
      response = %(
        <AssessmentResult>
          <ReceiptId>
            <IdValue>123</IdValue>
          </ReceiptId>
        </AssessmentResult>
      )

      expect { described_class.new.perform(response) }.to_not raise_exception
    end
  end

  describe 'saville assessment is not present' do
    let(:saville_user_assessment) { create(:saville_user_assessment, request_id: 123) }
    let(:user_assessment) { saville_user_assessment.user_assessment }
    let!(:report) { create(:report, :saville, assessments: [user_assessment.assessment]) }

    it "doesn't return exception if results are blank" do
      response = %(
        <AssessmentResult>
          <ReceiptId>
            <IdValue>#{saville_user_assessment.request_id}</IdValue>
          </ReceiptId>
        </AssessmentResult>
      )

      expect { described_class.new.perform(response) }.to_not raise_exception
    end

    it 'saves pdf to user report' do
      user_report = create(:user_report, report: report, campaign_id: user_assessment.campaign_id,
        user_id: user_assessment.subject_id, pdf: nil, status: :not_prepared)

      response = %(
        <AssessmentResult>
          <ReceiptId>
            <IdValue>#{saville_user_assessment.request_id}</IdValue>
          </ReceiptId>
          <Results>
            <SupportingMaterials>
              <Id><IdValue>#{report.external_report_id}</IdValue></Id>
              <EmbeddedData>
                <EncodedContent>#{file_fixture('base64pdf.txt').read}</EncodedContent>
              </EmbeddedData>
            </SupportingMaterials>
          </Results>
        </AssessmentResult>
      )

      described_class.new.perform(response)
      user_report.reload
      expect(user_report.status).to eq('prepared')
      expect(user_report.pdf?).to eq(true)
    end

    it 'saves scores' do
      create(:user_report, report: report, campaign_id: user_assessment.campaign_id,
        user_id: user_assessment.subject_id, pdf: nil, status: :not_prepared)

      described_class.new.perform(score_response)
      scores = user_assessment.users_result.reload.external_results['scores']
      expect(scores).to eq(
        [
          { 'id' => 'WAVEFS_RATACQ', 'score' => 1.0, 'score_type' => 'Normative', 'value_type' => 'sten' },
          { 'id' => 'WAVEFS_CONRANK', 'score' => 2.0, 'score_type' => 'Ipsative', 'value_type' => 'Percentile' }
        ]
      )
    end

    it 'merges scores from multiple results and returns uniq values' do
      create(:user_report, report: report, campaign_id: user_assessment.campaign_id,
        user_id: user_assessment.subject_id, pdf: nil, status: :not_prepared)

      response = %(
        <AssessmentResult>
          <ReceiptId>
            <IdValue>#{saville_user_assessment.request_id}</IdValue>
          </ReceiptId>
          <Results>
            <DetailResult>
              <Description>Ratings Acquiescence</Description>
                <CompetencyAssessed>
                  <CompetencyId idOwner="Saville Consulting">
                    <IdValue name="Reference">WAVEFS_RATACQ</IdValue>
                    <IdValue name="Type">Normative</IdValue>
                  </CompetencyId>
                </CompetencyAssessed>
              <Score type='sten'>1</Score>
            </DetailResult>
            <DetailResult>
              <Description>Consistency of Rankings</Description>
              <CompetencyAssessed>
                <CompetencyId idOwner="Saville Consulting">
                  <IdValue name="Reference">WAVEFS_CONRANK</IdValue>
                  <IdValue name="Type">Ipsative</IdValue>
                </CompetencyId>
              </CompetencyAssessed>
              <Score type="Percentile">2.0</Score>
            </DetailResult>
          </Results>
          <Results>
            <DetailResult>
              <Description>Ratings Acquiescence</Description>
                <CompetencyAssessed>
                  <CompetencyId idOwner="Saville Consulting">
                    <IdValue name="Reference">WAVEFS_RATACQ</IdValue>
                    <IdValue name="Type">Raw</IdValue>
                  </CompetencyId>
                </CompetencyAssessed>
              <Score type='sten'>2</Score>
            </DetailResult>
            <DetailResult>
              <Description>Consistency of Rankings</Description>
              <CompetencyAssessed>
                <CompetencyId idOwner="Saville Consulting">
                  <IdValue name="Reference">WAVEFS_CONRANK</IdValue>
                  <IdValue name="Type">Ipsative</IdValue>
                </CompetencyId>
              </CompetencyAssessed>
              <Score type='Percentile'>2.0</Score>
            </DetailResult>
          </Results>
        </AssessmentResult>
      )

      described_class.new.perform(response)
      scores = user_assessment.users_result.reload.external_results['scores']
      expect(scores).to eq(
        [
          { 'id' => 'WAVEFS_RATACQ', 'score' => 1.0, 'score_type' => 'Normative', 'value_type' => 'sten' },
          { 'id' => 'WAVEFS_CONRANK', 'score' => 2.0, 'score_type' => 'Ipsative', 'value_type' => 'Percentile' },
          { 'id' => 'WAVEFS_RATACQ', 'score' => 2.0, 'score_type' => 'Raw', 'value_type' => 'sten' }
        ]
      )
    end

    it 'saves metadata' do
      create(:user_report, report: report, campaign_id: user_assessment.campaign_id,
        user_id: user_assessment.subject_id, pdf: nil, status: :not_prepared)

      response = %(
        <AssessmentResult>
          <ReceiptId>
            <IdValue>#{saville_user_assessment.request_id}</IdValue>
          </ReceiptId>
          <Results>
            <SupportingMaterials>
              <EffectiveDate>
                <StartDate>2021-06-09</StartDate>
                <EndDate>2022-06-10</EndDate>
              </EffectiveDate>
            </SupportingMaterials>
          </Results>
        </AssessmentResult>
      )

      described_class.new.perform(response)
      meta_data = user_assessment.users_result.reload.external_results['meta_data']
      expect(meta_data).to eq({ 'start_date' => '2021-06-09', 'end_date' => '2022-06-10' })
    end

    it 'marks user_assessment as completed and calculates scoring' do
      dimension = user_assessment.assessment.dimension
      external_scoring = [{
        'type' => 'norm_score',
        'jsonpath' => "$.scores[?(@.id=='WAVEFS_RATACQ' && @.score_type == 'Normative' && @.value_type=='sten')].score"
      }]
      factor = create(
        :factor,
        dimension: dimension,
        scoring_strategy: 'external_score',
          external_scoring: external_scoring
      )
      create(:user_report, report: report, campaign_id: user_assessment.campaign_id,
        user_id: user_assessment.subject_id, pdf: nil, status: :not_prepared)

      described_class.new.perform(score_response)
      scores = user_assessment.users_result.reload.external_results['scores']
      expect(scores).to eq(
        [
          { 'id' => 'WAVEFS_RATACQ', 'score' => 1.0, 'score_type' => 'Normative', 'value_type' => 'sten' },
          { 'id' => 'WAVEFS_CONRANK', 'score' => 2.0, 'score_type' => 'Ipsative', 'value_type' => 'Percentile' }
        ]
      )
      expect(user_assessment.reload.status).to eq('completed')
      expect(user_assessment.users_result.scoring).to eq({ factor.id.to_s => { 'norm_score' => 1.0 } })
    end
  end
end
