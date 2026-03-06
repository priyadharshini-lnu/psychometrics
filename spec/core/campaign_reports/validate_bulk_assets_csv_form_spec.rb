# frozen_string_literal: true

require 'rails_helper'

describe CampaignReports::ValidateBulkAssetsCsvForm do
  let(:user_reports_by_email) { {} }

  describe '#validate_csv' do
    context 'when CSV is empty' do
      let(:parsed_csv_data) { CSV::Table.new([]) }

      it 'adds an error for empty CSV' do
        form = described_class.new(parsed_csv_data: parsed_csv_data, user_reports_by_email: user_reports_by_email)
        form.validate

        expect(form.errors.full_messages).to include(
          I18n.t('administration.campaign_report.bulk_assets_upload.errors.csv_cannot_be_empty')
        )
      end
    end

    context 'when CSV has invalid headers' do
      let(:parsed_csv_data) do
        csv_string = "wrong_header1,wrong_header2\nvalue1,value2\n"
        CSV.parse(csv_string, headers: true)
      end

      it 'adds an error for invalid headers' do
        form = described_class.new(parsed_csv_data: parsed_csv_data, user_reports_by_email: user_reports_by_email)
        form.validate

        expect(form.errors.full_messages).to include(
          I18n.t(
            'administration.campaign_report.bulk_assets_upload.errors.csv_must_contain_two_headers',
            headers: described_class::EXPECTED_HEADERS.join(', ')
          )
        )
      end
    end

    context 'when CSV has blank values' do
      let(:parsed_csv_data) do
        csv_string = "user_email,file_name\n,file1.pdf\n"
        CSV.parse(csv_string, headers: true)
      end

      it 'adds an error for blank values' do
        form = described_class.new(parsed_csv_data: parsed_csv_data, user_reports_by_email: user_reports_by_email)
        form.validate

        expect(form.errors.full_messages).to include(
          I18n.t('administration.campaign_report.bulk_assets_upload.errors.csv_contains_blank_values')
        )
      end
    end

    context 'when CSV is valid' do
      let(:parsed_csv_data) do
        csv_string = "user_email,file_name\nuser@example.com,file1.pdf\n"
        CSV.parse(csv_string, headers: true)
      end
      let!(:user_reports_by_email) { { 'user@example.com' => 'Report content' } }

      it 'does not add any errors' do
        form = described_class.new(parsed_csv_data: parsed_csv_data, user_reports_by_email: user_reports_by_email)
        form.validate

        expect(form.errors).to be_empty
      end
    end

    context 'when CSV has more than max emails' do
      let(:parsed_csv_data) do
        csv_header = ['user_email,file_name']
        csv_rows = (1..(described_class::MAX_EMAILS + 1)).map do |i|
          "user#{i}@example.com,file#{i}.pdf"
        end
        csv_string = (csv_header + csv_rows).join("\n")
        CSV.parse(csv_string, headers: true)
      end

      it 'adds an error for exceeding max emails' do
        form = described_class.new(parsed_csv_data: parsed_csv_data, user_reports_by_email: user_reports_by_email)
        form.validate

        expect(form.errors.full_messages).to include(
          I18n.t(
            'administration.campaign_report.bulk_assets_upload.errors.max_emails_in_csv',
            max: described_class::MAX_EMAILS,
            count: described_class::MAX_EMAILS + 1
          )
        )
      end
    end

    context 'when CSV has missing user reports' do
      let(:parsed_csv_data) do
        csv_string = "user_email,file_name\nuser@example.com,file1.pdf\n"
        CSV.parse(csv_string, headers: true)
      end

      it 'adds an error for missing user reports' do
        form = described_class.new(parsed_csv_data: parsed_csv_data, user_reports_by_email: user_reports_by_email)
        form.validate

        expect(form.errors.full_messages).to include(
          I18n.t(
            'administration.campaign_report.bulk_assets_upload.errors.missing_user_reports',
            emails: 'user@example.com'
          )
        )
      end
    end

    context 'when CSV has non-pdf file names' do
      let(:parsed_csv_data) do
        csv_string = "user_email,file_name\nuser@example.com,file1.txt\n"
        CSV.parse(csv_string, headers: true)
      end

      it 'adds an error for non-pdf file names' do
        form = described_class.new(parsed_csv_data: parsed_csv_data, user_reports_by_email: user_reports_by_email)
        form.validate

        expect(form.errors.full_messages).to include(
          I18n.t('administration.campaign_report.bulk_assets_upload.errors.all_file_names_must_have_pdf_extension')
        )
      end
    end

    context 'when CSV has duplicate file names' do
      let(:parsed_csv_data) do
        csv_string = "user_email,file_name\nuser@example.com,file1.pdf\nuser@example.com,file1.pdf\n"
        CSV.parse(csv_string, headers: true)
      end

      it 'adds an error for duplicate file names' do
        form = described_class.new(parsed_csv_data: parsed_csv_data, user_reports_by_email: user_reports_by_email)
        form.validate

        expect(form.errors.full_messages).to include(
          I18n.t('administration.campaign_report.bulk_assets_upload.errors.csv_file_name_must_be_unique')
        )
      end
    end

    context 'when CSV has duplicate user emails' do
      let(:parsed_csv_data) do
        csv_string = "user_email,file_name\nuser@example.com,file1.pdf\nuser@example.com,file2.pdf\n"
        CSV.parse(csv_string, headers: true)
      end

      it 'adds an error for duplicate user emails' do
        form = described_class.new(parsed_csv_data: parsed_csv_data, user_reports_by_email: user_reports_by_email)
        form.validate

        expect(form.errors.full_messages).to include(
          I18n.t('administration.campaign_report.bulk_assets_upload.errors.csv_user_emails_must_be_unique')
        )
      end
    end
  end
end
