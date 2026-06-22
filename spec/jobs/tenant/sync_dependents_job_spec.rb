# frozen_string_literal: true

require 'rails_helper'

describe Tenant::SyncDependentsJob do
  include ActiveJob::TestHelper

  let(:tenant_a) { create(:tenancy) }
  let(:tenant_b) { create(:tenancy) }

  describe '#perform' do
    it 'syncs assessment direct-source dependents and nested translations' do
      assessment = create(:assessment, owner: tenant_a)
      question = create(:question, assessment: assessment)
      consent_setting = AssessmentConsentSetting.create!(assessment: assessment)
      consent_setting.update!(custom_consent_text: 'Consent text')
      consent_translation = consent_setting.translations.first

      expect(question.tenant_id).to eq(tenant_a.id)
      expect(consent_setting.tenant_id).to eq(tenant_a.id)
      expect(consent_translation.tenant_id).to eq(tenant_a.id)

      assessment.skip_owner_validation = true
      assessment.update!(owner: tenant_b)

      described_class.perform_now('Assessment', assessment.id)

      expect(question.reload.tenant_id).to eq(tenant_b.id)
      expect(consent_setting.reload.tenant_id).to eq(tenant_b.id)
      expect(consent_translation.reload.tenant_id).to eq(tenant_b.id)
    end

    it 'syncs report direct-source dependents through page and module' do
      report = create(:report, owner: tenant_a)
      page = create(:page, report: report)
      report_module = create(:module, page: page, assessment: report.assessment)

      expect(page.tenant_id).to eq(tenant_a.id)
      expect(report_module.tenant_id).to eq(tenant_a.id)

      report.skip_owner_validation = true
      report.update!(owner: tenant_b)

      described_class.perform_now('Report', report.id)

      expect(page.reload.tenant_id).to eq(tenant_b.id)
      expect(report_module.reload.tenant_id).to eq(tenant_b.id)
    end

    it 'syncs dimension direct-source dependents and translated grandchildren' do
      dimension = create(:dimension, owner: tenant_a)
      factor = create(:factor, dimension: dimension)
      factor_translation = factor.translations.first

      expect(factor.tenant_id).to eq(tenant_a.id)
      expect(factor_translation.tenant_id).to eq(tenant_a.id)

      dimension.skip_owner_validation = true
      dimension.update!(owner: tenant_b)

      described_class.perform_now('Dimension', dimension.id)

      expect(factor.reload.tenant_id).to eq(tenant_b.id)
      expect(factor_translation.reload.tenant_id).to eq(tenant_b.id)
    end

    it 'keeps first tenant_source precedence for multi-source dependents' do
      dimension = create(:dimension, owner: tenant_a)
      factor = create(:factor, dimension: dimension)
      norm = create(:norm, owner: tenant_b, dimension: dimension, with_factors_norm: false)
      factors_norm = create(:factors_norm, factor: factor, norm: norm)

      expect(factors_norm.tenant_id).to eq(tenant_b.id)

      dimension.skip_owner_validation = true
      dimension.update!(owner_id: nil)

      described_class.perform_now('Dimension', dimension.id)

      expect(factor.reload.tenant_id).to be_nil
      expect(factors_norm.reload.tenant_id).to eq(tenant_b.id)
    end

    it 'falls back to next tenant_source when the first source resolves to nil' do
      dimension = create(:dimension, owner: tenant_a)
      factor = create(:factor, dimension: dimension)
      norm = create(:norm, owner: nil, dimension: dimension, with_factors_norm: false)
      factors_norm = create(:factors_norm, factor: factor, norm: norm)

      expect(factors_norm.tenant_id).to eq(tenant_a.id)

      dimension.skip_owner_validation = true
      dimension.update!(owner: tenant_b)

      described_class.perform_now('Dimension', dimension.id)

      expect(factor.reload.tenant_id).to eq(tenant_b.id)
      expect(factors_norm.reload.tenant_id).to eq(tenant_b.id)
    end

    it 'syncs factors_norm when norm tenant changes' do
      dimension = create(:dimension, owner: tenant_a)
      factor = create(:factor, dimension: dimension)
      norm = create(:norm, owner: tenant_a, dimension: dimension, with_factors_norm: false)
      factors_norm = create(:factors_norm, factor: factor, norm: norm)

      expect(factors_norm.tenant_id).to eq(tenant_a.id)

      norm.skip_owner_validation = true
      norm.update!(owner: tenant_b)

      described_class.perform_now('Norm', norm.id)

      expect(factors_norm.reload.tenant_id).to eq(tenant_b.id)
    end

    it 'does not enqueue recursive dependent sync jobs while cascading complex chains' do
      dimension = create(:dimension, owner: tenant_a)
      factor = create(:factor, dimension: dimension)
      norm = create(:norm, owner: tenant_a, dimension: dimension, with_factors_norm: false)
      factors_norm = create(:factors_norm, factor: factor, norm: norm)

      norm.skip_owner_validation = true
      norm.update!(owner: tenant_b)
      clear_enqueued_jobs

      expect do
        described_class.perform_now('Norm', norm.id)
      end.not_to have_enqueued_job(Tenant::SyncDependentsJob)

      expect(factors_norm.reload.tenant_id).to eq(tenant_b.id)
    end

    it 'does nothing for classes without cascade support' do
      expect { described_class.perform_now('Audited::Audit', 123) }.not_to raise_error
    end
  end

  describe 'manual tenant_id audit tracking' do
    it 'cascades tenant_id changes to direct dependents' do
      assessment = create(:assessment, owner: tenant_a)
      question = create(:question, assessment: assessment)

      expect(question.tenant_id).to eq(tenant_a.id)

      assessment.skip_owner_validation = true
      assessment.update!(owner: tenant_b)

      described_class.perform_now('Assessment', assessment.id)

      expect(question.reload.tenant_id).to eq(tenant_b.id)
    end

    it 'cascades tenant_id changes in multi-level chains' do
      dimension = create(:dimension, owner: tenant_a)
      factor = create(:factor, dimension: dimension)
      factor_translation = factor.translations.first

      expect(factor.tenant_id).to eq(tenant_a.id)
      expect(factor_translation.tenant_id).to eq(tenant_a.id)

      dimension.skip_owner_validation = true
      dimension.update!(owner: tenant_b)

      described_class.perform_now('Dimension', dimension.id)

      expect(factor.reload.tenant_id).to eq(tenant_b.id)
      expect(factor_translation.reload.tenant_id).to eq(tenant_b.id)
    end

    it 'handles nil tenant_id changes correctly' do
      assessment = create(:assessment, owner: tenant_a)
      question = create(:question, assessment: assessment)

      expect(question.tenant_id).to eq(tenant_a.id)

      assessment.skip_owner_validation = true
      assessment.update!(owner_id: nil)

      described_class.perform_now('Assessment', assessment.id)

      expect(question.reload.tenant_id).to be_nil
    end

    it 'handles multi-source precedence with cascade' do
      dimension = create(:dimension, owner: tenant_a)
      factor = create(:factor, dimension: dimension)
      norm = create(:norm, owner: tenant_a, dimension: dimension, with_factors_norm: false)
      factors_norm = create(:factors_norm, factor: factor, norm: norm)

      # factors_norm should have tenant_a.id from both norm and factor
      expect(factors_norm.tenant_id).to eq(tenant_a.id)

      # Update norm, factors_norm should cascade from norm (first in tenant_source)
      norm.skip_owner_validation = true
      norm.update!(owner: tenant_b)

      described_class.perform_now('Norm', norm.id)

      expect(factors_norm.reload.tenant_id).to eq(tenant_b.id)
    end

    it 'uses fallback source when primary is nil' do
      dimension = create(:dimension, owner: tenant_a)
      factor = create(:factor, dimension: dimension)
      norm = create(:norm, owner: nil, dimension: dimension, with_factors_norm: false)
      factors_norm = create(:factors_norm, factor: factor, norm: norm)

      # factors_norm should get tenant from factor (fallback) since norm owner is nil
      expect(factors_norm.reload.tenant_id).to eq(tenant_a.id)
    end
  end
end
