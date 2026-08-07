# frozen_string_literal: true

require 'rails_helper'

describe Reports::CopyReport do
  context '.call' do
    let(:client) { create(:tenancy) }

    let(:report) do
      filters = create_list(:filter, 2)
      campaign_factors = create_list(:report_campaign_factor, 2)

      report = build(:report, owner_id: client.id)
      pages = build_list(:page, 2)
      module1 = build(:module)
      module2 = build(:module, props: { filters: [filters.first.id, filters.last.id] })
      module3 = build(:module, props: { filters: filters.first.id })
      module4 = build(:module)

      modules = [module1, module2, module3, module4]

      create(:translation, translateable: modules.first, resource: report)

      pages[0].modules << modules.first(2)
      pages[1].modules << modules.last(2)

      report.pages << pages

      create(:translation, translateable: filters.first, resource: report)
      report.filters << filters

      report.campaign_factors << campaign_factors

      report.save!
      report
    end

    let!(:user) { create(:client_admin, client: client) }

    before do
      occupation = create(:occupation)
      create(:translation, translateable: occupation, resource: report)

      factor = create(:factor)
      create(:translation, translateable: factor, resource: report)

      report.campaign_factors.each do |campaign_factor|
        create(:translation, translateable: campaign_factor, resource: report)
      end
    end

    context 'Success' do
      subject { described_class.call(report.id, user, client.id, new_report_name: "Copy of #{report.name}") }

      it 'broadcasts :ok' do
        expect { subject }.to broadcast(:ok)
        expect(subject[:ok]).to be_an_instance_of(Report)
        expect(subject[:ok].persisted?).to be_truthy
        expect(subject[:ok].name).to eq("Copy of #{report.name}")
      end

      it 'saves passed report name' do
        report_name = Faker::Name.name
        new_report = described_class.call!(report.id, user, client.id, new_report_name: report_name)

        expect(new_report.name).to eq(report_name)
      end

      it 'copies all pages' do
        copy = subject[:ok]

        expect(copy.pages.length).to eq(report.pages.length)
      end

      it 'copies all modules of each page' do
        copy = subject[:ok]

        expect(copy.pages.first.modules.length).to eq(report.pages.first.modules.length)
      end

      it 'new modules contain updated filter ids' do
        copy = subject[:ok]

        expect(copy.pages.first.modules.last.props['filters']).to eq(copy.filter_ids)
        expect(copy.pages.last.modules.first.props['filters']).to eq(copy.filters.first.id)
      end

      it 'copies translations of modules' do
        copy = subject[:ok]

        expect(
          copy.pages.first.modules.first.translations.length
        ).to eq(
          report.pages.first.modules.first.translations.length
        )

        translation = copy.pages.first.modules.first.translations.first

        expect(translation.resource_id).to eq(copy.id)
      end

      it 'copies filters' do
        copy = subject[:ok]

        expect(copy.filters.length).to eq(2)
        expect(copy.filters.length).to eq(report.filters.length)
      end

      it 'copies filter translations' do
        copy = subject[:ok]

        expect(report.filters.first.translations.length).to eq(1)
        expect(copy.filters.first.translations.length).to eq(1)
      end

      it 'copies campaign factors' do
        copy = subject[:ok]

        expect(copy.campaign_factors.length).to eq(report.campaign_factors.length)
      end

      it 'copies campaign factor translations' do
        copy = subject[:ok]

        expect(report.campaign_factors.first.translations.length).to eq(1)
        expect(copy.campaign_factors.first.translations.length).to eq(1)
      end

      it 'copies factor translations' do
        copy = subject[:ok]
        translations = Translation.for_report(copy.id).where(translateable_type: 'Factor')

        expect(translations.length).to eq(1)
      end

      it 'copies occupation translations' do
        copy = subject[:ok]
        translations = Translation.for_report(copy.id).where(translateable_type: 'Occupation')

        expect(translations.length).to eq(1)
      end

      it 'copied report is linked to all assessments of the original report' do
        copy = subject[:ok]

        expect(copy.assessments.length).to eq(report.assessments.length)
      end

      it 'copies report for a different owner even when linked assessment owner differs' do
        other_owner = create(:tenancy)
        report.assessments.each { |assessment| assessment.update!(owner_id: client.id) }

        copy = described_class.call!(
          report.id,
          user,
          other_owner.id,
          skip_owner_validation: true,
          new_report_name: "Copy of #{report.name}"
        )

        expect(copy).to be_persisted
        expect(copy.owner_id).to eq(other_owner.id)
      end
    end
  end
end
