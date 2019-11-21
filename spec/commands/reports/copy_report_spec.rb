# frozen_string_literal: true

require 'rails_helper'

describe Reports::CopyReport do
  context '.call' do
    let(:report) do
      report = build(:report)
      pages = build_list(:page, 2)
      modules = build_list(:module, 4)

      create(:translation, translateable: modules.first, resource: report)

      pages[0].modules << modules.first(2)
      pages[1].modules << modules.last(2)

      report.pages << pages

      filters = build_list(:filter, 2)

      create(:translation, translateable: filters.first, resource: report)
      report.filters << filters

      report.save!
      report
    end

    context 'Success' do
      subject { described_class.call(report.id) }

      it 'broadcasts :ok' do
        expect { subject }.to broadcast(:ok)
        expect(subject[:ok]).to be_an_instance_of(Report)
        expect(subject[:ok].persisted?).to be_truthy
      end

      it 'copies all pages' do
        copy = subject[:ok]

        expect(copy.pages.length).to eq(report.pages.length)
      end

      it 'copies all modules of each page' do
        copy = subject[:ok]

        expect(copy.pages.first.modules.length).to eq(report.pages.first.modules.length)
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
    end
  end
end
