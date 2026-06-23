# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::AssessmentRawAIFactorExport do
  let(:campaign) { create(:campaign) }
  let!(:dimension) { create(:dimension, :with_factor) }
  let(:factor) { dimension.factors.first }
  let!(:assessment) { create(:assessment, :agile, dimension_id: dimension.id) }
  let(:subject) { create(:user, first_name: 'Subject', last_name: 'User') }
  let(:evaluator) { create(:user, first_name: 'Evaluator', last_name: 'User') }
  let(:assessor) { create(:user, first_name: 'Assessor', last_name: 'User') }
  let(:approver) { create(:user, first_name: 'Approver', last_name: 'User') }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: subject, active: true) }
  let!(:users_result) do
    create(:users_result, subject: subject, evaluator: evaluator, campaign: campaign, assessment: assessment,
                          status: :completed, score_calculated: false, ai_scoring_status: :pending)
  end
  let!(:user_assessment) do
    users_result.user_assessment.tap do |record|
      record.update!(
        score_calculated_at: Time.zone.parse('2026-01-10 10:00:00'),
        approval_status: :pending,
        approval_status_updated_at: Time.zone.parse('2026-01-11 10:00:00'),
        score_assessed_by: assessor,
        score_approved_by: approver,
        score_assessed_at: Time.zone.parse('2026-01-12 10:00:00'),
        score_approved_at: Time.zone.parse('2026-01-13 10:00:00')
      )
    end
  end
  let!(:aggregated_score) do
    create(:ai_factor_score, users_result: users_result, factor: factor, scoring_type: :aggregated, score: 3.5)
  end
  let(:job_record) do
    create(:admin_job_record, operation: :assessment_raw_ai_factor_export,
                               data: { campaign_id: campaign.id, assessment_id: assessment.id })
  end

  it 'exports ai scoring status and aggregated ai factor scores' do
    users_result.update!(ai_scoring_status: :completed)
    described_class.call!(job_record)

    csv = Roo::CSV.new(active_storage_file_path(job_record.file))

    expect(csv.row(1)).to eq([
      'Result ID', 'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email',
      'Relationship', 'Started At', 'Completed At', 'Score Calculated At', 'Status',
      'AI Scoring Status', 'Approval Status', 'Approval Status Updated At', 'Score Assessed By',
      'Score Approved By', 'Score Assessed At', 'Score Approved At', 'factor 1'
    ])

    expect(csv.row(2)).to eq([
      users_result.encoded_id,
      'Subject, User',
      subject.email,
      'Evaluator, User',
      evaluator.email,
      user_assessment.relationship&.name,
      users_result.created_at.to_s,
      users_result.completed_at.to_s,
      user_assessment.score_calculated_at.to_s,
      'Completed',
      'completed',
      'pending',
      user_assessment.approval_status_updated_at.to_s,
      'Assessor, User',
      'Approver, User',
      user_assessment.score_assessed_at.to_s,
      user_assessment.score_approved_at.to_s,
      '3.5'
    ])
  end

  it 'exports unapproved records when ai_scoring_status is present' do
    users_result.update!(ai_scoring_status: :pending)

    described_class.call!(job_record)

    csv = Roo::CSV.new(active_storage_file_path(job_record.file))

    expect(csv.last_row).to eq(2)
    expect(csv.row(2)[10]).to eq('pending')
    expect(csv.row(2)[-1]).to eq('3.5')
  end

  it 'excludes records when ai_scoring_status is nil' do
    users_result.update!(ai_scoring_status: nil)

    described_class.call!(job_record)

    csv = Roo::CSV.new(active_storage_file_path(job_record.file))

    expect(csv.last_row).to eq(1)
  end

  context 'with different ai scoring statuses' do
    it 'includes records with pending ai scoring status' do
      users_result.update!(ai_scoring_status: :pending)
      described_class.call!(job_record)

      csv = Roo::CSV.new(active_storage_file_path(job_record.file))

      expect(csv.row(2)[10]).to eq('pending')
      expect(csv.row(2)[-1]).to eq('3.5')
    end

    it 'includes records with failed ai scoring status' do
      users_result.update!(ai_scoring_status: :failed)
      described_class.call!(job_record)

      csv = Roo::CSV.new(active_storage_file_path(job_record.file))

      expect(csv.row(2)[10]).to eq('failed')
      expect(csv.row(2)[-1]).to eq('3.5')
    end

    it 'includes records with processing ai scoring status' do
      users_result.update!(ai_scoring_status: :processing)
      described_class.call!(job_record)

      csv = Roo::CSV.new(active_storage_file_path(job_record.file))

      expect(csv.row(2)[10]).to eq('processing')
      expect(csv.row(2)[-1]).to eq('3.5')
    end
  end

  it 'exports nil scores for completed assessments without ai scores' do
    users_result.update!(ai_scoring_status: :pending)
    aggregated_score.destroy
    described_class.call!(job_record)

    csv = Roo::CSV.new(active_storage_file_path(job_record.file))

    expect(csv.row(2)[-1]).to be_nil
  end

  it 'exports parent aggregated score and derives indicator score using factor scoring strategy' do
    parent_factor = create(:factor, dimension: dimension, name: 'Competency A', scoring_strategy: :sub_factors_average)
    indicator_factor = create(:factor, dimension: dimension, name: 'Indicator A', scoring_strategy: :questions)
    indicator_question = create(:question, assessment: assessment)

    create(:factors_sub_factor, factor: parent_factor, sub_factor: indicator_factor, weight: 1)
    create(:factors_scoring, factor: indicator_factor, question: indicator_question, assessment: assessment)

    create(:ai_factor_score,
           users_result: users_result,
           factor: parent_factor,
           scoring_type: :aggregated,
           question_id: nil,
           score: 4.2)
    create(:ai_factor_score,
           users_result: users_result,
           factor: indicator_factor,
           scoring_type: :ai,
           question: indicator_question,
           score: 3.8)

    users_result.update!(ai_scoring_status: :completed)
    described_class.call!(job_record)

    csv = Roo::CSV.new(active_storage_file_path(job_record.file))
    header = csv.row(1)
    row = csv.row(2)

    parent_column = header.index('Competency A')
    indicator_column = header.index('Indicator A')

    expect(parent_column).to be_present
    expect(indicator_column).to be_present
    expect(row[parent_column]).to eq('4.2')
    expect(row[indicator_column]).to eq('3.8')
  end

  it 'exports final_score for aggregated records when override_score is present' do
    aggregated_score.update!(score: 3.5, override_score: 4.6)
    users_result.update!(ai_scoring_status: :completed)

    described_class.call!(job_record)

    csv = Roo::CSV.new(active_storage_file_path(job_record.file))

    expect(csv.row(2)[-1]).to eq('4.6')
  end

  it 'exports final_score for child ai records when override_score is present' do
    parent_factor = create(:factor, dimension: dimension, name: 'Competency A', scoring_strategy: :sub_factors_average)
    indicator_factor = create(:factor, dimension: dimension, name: 'Indicator A', scoring_strategy: :questions)
    indicator_question = create(:question, assessment: assessment)

    create(:factors_sub_factor, factor: parent_factor, sub_factor: indicator_factor, weight: 1)
    create(:factors_scoring, factor: indicator_factor, question: indicator_question, assessment: assessment)

    create(:ai_factor_score,
           users_result: users_result,
           factor: parent_factor,
           scoring_type: :aggregated,
           question_id: nil,
           score: 4.0)
    create(:ai_factor_score,
           users_result: users_result,
           factor: indicator_factor,
           scoring_type: :ai,
           question: indicator_question,
           score: 2.5,
           override_score: 4.5)

    users_result.update!(ai_scoring_status: :completed)
    described_class.call!(job_record)

    csv = Roo::CSV.new(active_storage_file_path(job_record.file))
    header = csv.row(1)
    row = csv.row(2)

    indicator_column = header.index('Indicator A')

    expect(row[indicator_column]).to eq('4.5')
  end

  it 'exports nil names and timestamps when approval metadata is not present' do
    user_assessment.update!(
      approval_status: :pending,
      approval_status_updated_at: nil,
      score_assessed_by: nil,
      score_approved_by: nil,
      score_assessed_at: nil,
      score_approved_at: nil
    )

    users_result.update!(ai_scoring_status: :completed)
    described_class.call!(job_record)

    csv = Roo::CSV.new(active_storage_file_path(job_record.file))
    row = csv.row(2)

    expect(row[11]).to eq('pending')
    expect(row[12]).to be_nil
    expect(row[13]).to eq('')
    expect(row[14]).to eq('')
    expect(row[15]).to be_nil
    expect(row[16]).to be_nil
  end

  it 'excludes inactive campaign users by default' do
    campaign_user.update!(active: false)
    users_result.update!(ai_scoring_status: :completed)

    described_class.call!(job_record)

    csv = Roo::CSV.new(active_storage_file_path(job_record.file))

    expect(csv.last_row).to eq(1)
  end

  it 'includes inactive campaign users when requested' do
    campaign_user.update!(active: false)
    users_result.update!(ai_scoring_status: :completed)
    job_record.update!(data: job_record.data.merge('include_inactive_users' => true))

    described_class.call!(job_record)

    csv = Roo::CSV.new(active_storage_file_path(job_record.file))

    expect(csv.last_row).to eq(2)
    expect(csv.row(2)[0]).to eq(users_result.encoded_id)
  end

  it 'does not derive child score when only an aggregated child record exists' do
    parent_factor = create(:factor, dimension: dimension, name: 'Competency A', scoring_strategy: :sub_factors_average)
    indicator_factor = create(:factor, dimension: dimension, name: 'Indicator A', scoring_strategy: :questions)

    create(:factors_sub_factor, factor: parent_factor, sub_factor: indicator_factor, weight: 1)
    create(:ai_factor_score,
           users_result: users_result,
           factor: parent_factor,
           scoring_type: :aggregated,
           question_id: nil,
           score: 4.2)
    create(:ai_factor_score,
           users_result: users_result,
           factor: indicator_factor,
           scoring_type: :aggregated,
           question_id: nil,
           score: 3.9)

    users_result.update!(ai_scoring_status: :completed)
    described_class.call!(job_record)

    csv = Roo::CSV.new(active_storage_file_path(job_record.file))
    header = csv.row(1)
    row = csv.row(2)

    indicator_column = header.index('Indicator A')

    expect(row[indicator_column]).to eq('3.9')
  end

  it 'exports nil child score when child factor has no ai question scores' do
    parent_factor = create(:factor, dimension: dimension, name: 'Competency A', scoring_strategy: :sub_factors_average)
    indicator_factor = create(:factor, dimension: dimension, name: 'Indicator A', scoring_strategy: :questions)

    create(:factors_sub_factor, factor: parent_factor, sub_factor: indicator_factor, weight: 1)
    create(:ai_factor_score,
           users_result: users_result,
           factor: parent_factor,
           scoring_type: :aggregated,
           question_id: nil,
           score: 4.2)

    users_result.update!(ai_scoring_status: :completed)
    described_class.call!(job_record)

    csv = Roo::CSV.new(active_storage_file_path(job_record.file))
    header = csv.row(1)
    row = csv.row(2)

    indicator_column = header.index('Indicator A')

    expect(row[indicator_column]).to be_nil
  end

  context 'with mixed hierarchy and factor score sources' do
    let!(:parent_factor_a) do
      create(:factor, dimension: dimension, name: 'Competency A', scoring_strategy: :sub_factors_average)
    end
    let!(:parent_factor_b) do
      create(:factor, dimension: dimension, name: 'Competency B', scoring_strategy: :sub_factors_average)
    end
    let!(:indicator_single_parent) do
      create(:factor, dimension: dimension, name: 'Indicator Single Parent', scoring_strategy: :questions_sum)
    end
    let!(:shared_sub_factor) do
      create(:factor, dimension: dimension, name: 'Shared Sub Factor', scoring_strategy: :questions)
    end
    let!(:standalone_factor) do
      create(:factor, dimension: dimension, name: 'Standalone Factor', scoring_strategy: :questions)
    end

    let!(:indicator_question_one) { create(:question, assessment: assessment) }
    let!(:indicator_question_two) { create(:question, assessment: assessment) }
    let!(:shared_question_one) { create(:question, assessment: assessment) }
    let!(:shared_question_two) { create(:question, assessment: assessment) }

    before do
      create(:factors_sub_factor, factor: parent_factor_a, sub_factor: indicator_single_parent, weight: 1)
      create(:factors_sub_factor, factor: parent_factor_a, sub_factor: shared_sub_factor, weight: 1)
      create(:factors_sub_factor, factor: parent_factor_b, sub_factor: shared_sub_factor, weight: 1)

      create(:factors_scoring,
             factor: indicator_single_parent,
             question: indicator_question_one,
             assessment: assessment)
      create(:factors_scoring,
             factor: indicator_single_parent,
             question: indicator_question_two,
             assessment: assessment)
      create(:factors_scoring,
             factor: shared_sub_factor,
             question: shared_question_one,
             assessment: assessment)
      create(:factors_scoring,
             factor: shared_sub_factor,
             question: shared_question_two,
             assessment: assessment)

      create(:ai_factor_score,
             users_result: users_result,
             factor: parent_factor_a,
             scoring_type: :aggregated,
             question_id: nil,
             score: 4.4)
      create(:ai_factor_score,
             users_result: users_result,
             factor: parent_factor_b,
             scoring_type: :aggregated,
             question_id: nil,
             score: 4.0)
      create(:ai_factor_score,
             users_result: users_result,
             factor: standalone_factor,
             scoring_type: :aggregated,
             question_id: nil,
             score: 3.7)

      create(:ai_factor_score,
             users_result: users_result,
             factor: indicator_single_parent,
             scoring_type: :ai,
             question: indicator_question_one,
             score: 1.5)
      create(:ai_factor_score,
             users_result: users_result,
             factor: indicator_single_parent,
             scoring_type: :ai,
             question: indicator_question_two,
             score: 2.0)

      create(:ai_factor_score,
             users_result: users_result,
             factor: shared_sub_factor,
             scoring_type: :ai,
             question: shared_question_one,
             score: 2.0)
      create(:ai_factor_score,
             users_result: users_result,
             factor: shared_sub_factor,
             scoring_type: :ai,
             question: shared_question_two,
             score: 4.0)
    end

    it 'orders factors by id in competency then child then standalone order' do
      users_result.update!(ai_scoring_status: :completed)
      described_class.call!(job_record)

      csv = Roo::CSV.new(active_storage_file_path(job_record.file))
      header = csv.row(1)

      expected_order = []
      processed = Set.new

      [parent_factor_a, parent_factor_b].sort_by(&:id).each do |parent|
        next if processed.include?(parent.id)

        expected_order << parent.name
        processed.add(parent.id)

        parent.sub_factors.sort_by(&:id).each do |sub_factor|
          next if processed.include?(sub_factor.id)

          expected_order << sub_factor.name
          processed.add(sub_factor.id)
        end
      end

      [standalone_factor].sort_by(&:id).each do |factor_record|
        next if processed.include?(factor_record.id)

        expected_order << factor_record.name
        processed.add(factor_record.id)
      end

      actual_order = header.select { |name| expected_order.include?(name) }
      expect(actual_order).to eq(expected_order)
      expect(header.count(shared_sub_factor.name)).to eq(1)
    end

    it 'uses strategy-based scores for children and aggregated scores for parents and standalone factors' do
      users_result.update!(ai_scoring_status: :completed)
      described_class.call!(job_record)

      csv = Roo::CSV.new(active_storage_file_path(job_record.file))
      header = csv.row(1)
      row = csv.row(2)

      parent_a_index = header.index(parent_factor_a.name)
      parent_b_index = header.index(parent_factor_b.name)
      indicator_index = header.index(indicator_single_parent.name)
      shared_index = header.index(shared_sub_factor.name)
      standalone_index = header.index(standalone_factor.name)

      expect(row[parent_a_index].to_f).to eq(4.4)
      expect(row[parent_b_index].to_f).to eq(4.0)
      expect(row[standalone_index].to_f).to eq(3.7)

      expect(row[indicator_index].to_f).to eq(3.5)
      expect(row[shared_index].to_f).to eq(3.0)
    end
  end
end
