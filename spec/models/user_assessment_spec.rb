# frozen_string_literal: true

require 'rails_helper'
require 'sidekiq/testing'

RSpec.describe UserAssessment, type: :model do
  include ActiveJob::TestHelper

  it {
    should define_enum_for(:status).
      with_values(not_started: 0, in_progress: 1, completed: 2, interrupted: 3, timed_out: 4, ineligible: 5)
  }

  describe '#external_user_reports' do
    it 'returns saville user_reports' do
      assessment = create(:assessment, :saville)
      report = create(:report, :saville, assessments: [assessment])
      user_assessment = create(:user_assessment, assessment: assessment)
      user_report = create(:user_report, user_id: user_assessment.subject_id,
        report_id: report.id, campaign_id: user_assessment.campaign_id)
      saville_user_reports = user_assessment.external_user_reports(:saville)

      expect(saville_user_reports).to include(user_report)
    end

    it 'returns chainable empty ActiveRecord::Relation object if there are no saville user_report' do
      user_assessment = create(:user_assessment)
      saville_user_reports = user_assessment.external_user_reports(:saville)

      expect(saville_user_reports.is_a?(ActiveRecord::Relation)).to eq(true)
      expect(saville_user_reports.count).to eq(0)
    end
  end

  describe '#applicable_external_norm_id' do
    it 'returns external_norm_id of campaign_assessment if present' do
      campaign_assessment = create(:campaign_assessment, external_norm_id: 'abc')
      campaign_assessment.assessment.update(external_settings: { norm_id: 'another_norm' })
      user_assessment = create(:user_assessment, campaign_id: campaign_assessment.campaign_id,
        assessment_id: campaign_assessment.assessment_id)

      expect(user_assessment.applicable_external_norm_id).to eq(campaign_assessment.external_norm_id)
    end

    it 'returns saville_norm_id of assessment if campaign_assessment is not present' do
      assessment = create(:assessment, :saville)
      user_assessment = create(:user_assessment, assessment: assessment)

      expect(user_assessment.applicable_external_norm_id).to eq(assessment.external_settings[:norm_id])
    end

    it 'returns pearson_norm_id of assessment if campaign_assessment is not present' do
      assessment = create(:assessment, :pearson)
      user_assessment = create(:user_assessment, assessment: assessment)

      expect(user_assessment.applicable_external_norm_id).to eq(assessment.external_settings[:norm_id])
    end
  end

  describe '#norm_name' do
    it 'returns saville_norm_name is assessment is saville' do
      user_assessment = build(
        :user_assessment,
        assessment: build(
          :assessment,
          :saville,
          external_settings: { assessment_id: 'A830E4AB-BC66-4238-92E0-6E6FD3FD1EDF' }
        )
      )
      build(
        :saville_user_assessment,
        user_assessment: user_assessment,
        norm_id: '05EDB032-2AB3-4B9E-8CCC-F5BCB7FE4337'
      )

      expect(user_assessment.norm_name).to eq('Wave Focus Styles V4 - Graduates - All (INT, IA, 2021)')
    end

    it 'returns pearson_norm_name is assessment is pearson' do
      norms = {
        'items' =>
          [{
            'label' => 'pearson_norm_name',
            'normId' => 'pearson_norm_id'
          }]
      }
      assessment = build(:assessment, :pearson)
      user_assessment = build(:user_assessment, assessment: assessment)
      create(:pearson_assessment, product_id: assessment.external_assessment_id, norms: norms)
      build(
        :pearson_user_assessment,
        user_assessment: user_assessment,
        norm_id: 'pearson_norm_id'
      )

      expect(user_assessment.norm_name).to eq('pearson_norm_name')
    end

    it 'returns regular norm name using norm_id column' do
      norm = create(:norm)
      user_assessment = build(:user_assessment, norm: norm)

      expect(user_assessment.norm_name).to eq(norm.name)
    end

    describe 'closed?' do
      let(:user) { create(:user) }

      it 'returns true if assessment is completed timed_out or ineligible' do
        user_assessment = create(:user_assessment, status: :completed)
        expect(user_assessment.closed?).to eq(true)

        user_assessment = create(:user_assessment, status: :timed_out)
        expect(user_assessment.closed?).to eq(true)

        user_assessment = create(:user_assessment, status: :ineligible)
        expect(user_assessment.closed?).to eq(true)

        user_assessment = create(:user_assessment, status: :in_progress)
        expect(user_assessment.closed?).to eq(false)
      end

      it 'returns true if campaign is closed inactive or archived' do
        user_assessment = create(:user_assessment, subject: user, evaluator: user, status: :in_progress)

        user_assessment.campaign.update(status: :closed)
        expect(user_assessment.reload.closed?).to eq(true)

        user_assessment.campaign.update(status: :inactive)
        expect(user_assessment.closed?).to eq(true)

        user_assessment.campaign.update(status: :archived)
        expect(user_assessment.closed?).to eq(true)

        user_assessment.campaign.update(status: :active)
        expect(user_assessment.closed?).to eq(false)
      end

      it 'returns false for non self assessment even if campaign is closed' do
        user_assessment = create(:user_assessment, subject: user, evaluator: create(:user), status: :in_progress)

        user_assessment.campaign.update(status: :closed)
        expect(user_assessment.reload.closed?).to eq(false)

        user_assessment.campaign.update(status: :inactive)
        expect(user_assessment.closed?).to eq(false)

        user_assessment.campaign.update(status: :archived)
        expect(user_assessment.closed?).to eq(false)
      end

      it 'returns true is if campaign_user schedule_start_date is in future' do
        campaign = create(:campaign)
        create(:campaign_user, campaign: campaign, user: user, schedule_start_date: 1.day.from_now)
        user_assessment = create(:user_assessment, campaign: campaign, subject: user, evaluator: user,
status: :in_progress)

        expect(user_assessment.closed?).to eq(true)
      end

      it 'returns true if campaign_user schedule_end_date is in past' do
        campaign = create(:campaign)
        create(:campaign_user, campaign: campaign, user: user, schedule_end_date: 1.day.ago)
        user_assessment = create(:user_assessment, campaign: campaign, subject: user, evaluator: user,
status: :in_progress)

        expect(user_assessment.closed?).to eq(true)
      end

      it 'returns false if campaign_user if current time is between schedule_start_date and schedule_end_date' do
        campaign = create(:campaign, status: :active)
        create(:campaign_user, campaign: campaign, user: user, schedule_start_date: 1.day.ago,
schedule_end_date: 1.day.from_now)
        user_assessment = create(:user_assessment, campaign: campaign, subject: user, evaluator: user,
status: :in_progress)

        expect(user_assessment.closed?).to eq(false)
      end
    end
  end

  describe 'Calculate and save campaign scoring' do
    let(:campaign) { create(:campaign) }
    let(:assessment) { create(:assessment) }
    let(:user) { create(:user) }
    let(:factor1) { create(:factor, dimension: assessment.dimension) }
    let!(:users_result) do
      scoring = {}
      scoring[factor1.id.to_s] = { 'norm_score' => 1, 'score' => 2 }
      create(
        :users_result, campaign: campaign, assessment: assessment,
        scoring: scoring, subject: user, evaluator: user, status: :in_progress
      )
    end

    it 'saves campaign scoring' do
      cf_factor1 = create(
        :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
        factor_type: 'assessment', assessment_score_type: 'score'
      )
      perform_enqueued_jobs do
        users_result.user_assessment.update!(status: :completed)
      end

      campaign_factor = user.campaign_factor_values.find_by(
        campaign_factor: cf_factor1, numeric_value: 2, campaign: users_result.campaign
      )
      expect(campaign_factor).to_not eq nil
    end

    it 'ignore calculating campaign scoring if user_assessment is not completed' do
      cf_factor1 = create(
        :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
        factor_type: 'assessment', assessment_score_type: 'score'
      )
      perform_enqueued_jobs do
        users_result.user_assessment.update!(status: :not_started)
      end
      campaign_factor = user.campaign_factor_values.find_by(
        campaign_factor: cf_factor1, numeric_value: 10, campaign: users_result.campaign
      )

      expect(campaign_factor).to eq nil
    end

    it 'ignore calculating campaign scoring if it is not a self assessment' do
      users_result.update!(evaluator: create(:user))
      cf_factor1 = create(
        :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
        factor_type: 'assessment', assessment_score_type: 'score'
      )
      perform_enqueued_jobs do
        users_result.user_assessment.update!(status: :completed)
      end
      campaign_factor = user.campaign_factor_values.find_by(
        campaign_factor: cf_factor1, numeric_value: 10, campaign: users_result.campaign
      )

      expect(campaign_factor).to eq nil
    end
  end
end
