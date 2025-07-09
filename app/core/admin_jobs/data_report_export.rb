# frozen_string_literal: true

module AdminJobs
  class DataReportExport < ::AdminJobs::BaseExportXlsx
    include ActionView::Helpers::TagHelper
    include ActionView::Context

    LIMIT = 1000

    COLUMN_HANDLERS = {
      'user_detail' => DataReports::FieldHandlers::UserDetailHandler,
      'campaign_detail' => DataReports::FieldHandlers::CampaignDetailHandler,
      'project_detail' => DataReports::FieldHandlers::ProjectDetailHandler,
      'assessment_score' => DataReports::FieldHandlers::AssessmentScoreHandler,
      'user_assessment_detail' => DataReports::FieldHandlers::UserAssessmentDetailHandler,
      'datasheet_value' => DataReports::FieldHandlers::DatasheetValueHandler,
      'campaign_score' => DataReports::FieldHandlers::CampaignScoreHandler
    }.freeze

    def initialize(record, _stage = nil)
      super
      unless data_report_job
        @data_report_job = data_report.data_report_jobs.create(created_by_id: record.owner_id,
                                                               admin_job_record_id: record.id)
        record.update(data: record.data.merge(data_report_job_id: @data_report_job.id))
      end
    end

    def generate_details
      []
    end

    def call
      unless valid?
        data_report_job.update!(status: :completed_with_errors)
        job_record.update(exception: I18n.t('errors.messages.data_report_blank'))
        job_record.completed!
        return broadcast :ok
      end

      generate_xlsx
      zip_and_protect
      data_report_job.update!(status: :completed, file: File.open(zip_file_name))
      clean_up
      job_record.complete!

      broadcast :ok
    rescue StandardError => e
      data_report_job.update!(status: :completed_with_errors)
      job_record.update!(exception: e.message)
      job_record.completed!
      broadcast :failed
    end

    def generate_xlsx
      workbook = FastExcel.open(file_path, constant_memory: true)

      worksheet = workbook.add_worksheet
      build_sections(worksheet, workbook)
      write_rows(worksheet, workbook)

      workbook.close
    end

    def write_rows(worksheet, _workbook)
      columns = config['sections'].pluck('columns').flatten

      worksheet.write_row(1, columns.pluck('name'))

      row_number = 2
      campaigns.each do |campaign|
        campaign_users = CampaignUser.includes({
          user: [:user_profile], campaign: %i[project campaign_factors]
        }, :user_assessments).where(campaign_id: campaign.id)
        context = {}

        campaign_users.find_each(batch_size: LIMIT).with_index do |cu, row_num|
          if (row_num % LIMIT).zero?
            offset = row_num / LIMIT
            context = build_context(campaign_users, offset, campaign)
          end

          values = columns.map do |column|
            COLUMN_HANDLERS[column['type']].call!(column, campaign_user: cu, ctx: context)
          end
          worksheet.write_row(row_number, values)
          row_number += 1
        end
      end
    end

    def build_context(campaign_users, offset, campaign)
      columns = config['sections'].pluck('columns').flatten
      context = {
        campaign: campaign
      }
      if columns.any? { |c| c['type'] == 'campaign_score' }
        ids = campaign_users.offset(offset).limit(LIMIT).pluck(:id)
        context[:campaign_factors] = campaign.campaign_factors.index_by(&:code)
        context[:campaign_scorings] = CampaignUsers::CampaignUserScoresQuery.new(
          campaign_id: campaign.id,
          campaign_user_ids: ids,
          filter: {
            offset: offset,
            limit: LIMIT
          }
        ).query.index_by { |s| s['id'] }
      end

      if columns.any? { |c| c['type'] == 'datasheet_value' }
        user_ids = campaign_users.offset(offset).limit(LIMIT).pluck(:user_id)
        emails = User.find(user_ids).pluck(:email)
        context[:datasheets] = ::Campaigns::GetDatasheetData.call!(campaigns.find(campaign.id), emails)
      end

      if columns.any? { |c| c['type'] == 'user_detail' }
        context[:custom_fields] = campaign.project.profile_setting.questions
      end

      context
    end

    def build_sections(worksheet, workbook)
      last_section_end = 0
      config['sections'].each do |section|
        formats = section['cell_format']
        format = workbook.add_format(bg_color: formats['bg_color'] || :white)
        format.set_font_size(formats['font_size'] || 10)
        format.set_align(:align_center)
        format.set_bold if formats['bold']

        worksheet.merge_range(
          0, last_section_end,
          0, last_section_end + section['columns'].size - 1,
          section['name'],
          format
        )
        last_section_end += section['columns'].size
      end
    end

    def zip_and_protect
      enc = Zip::TraditionalEncrypter.new(data_report_job.password)
      buffer = Zip::OutputStream.write_buffer(::StringIO.new(+''), enc) do |output|
        output.put_next_entry(file_name)
        output.write File.read(file_path)
      end
      File.binwrite(zip_file_name, buffer.string)
    end

    def clean_up
      FileUtils.remove_file(file_path)
    end

    def file_path
      directory = Rails.root.join('tmp', export_name, record.id.to_s)
      FileUtils.mkdir_p(directory)
      directory.join(file_name)
    end

    def zip_file_name
      file_path.to_s.gsub(/\.xlsx$/, '.zip')
    end

    def file_name
      "#{data_report.name.parameterize(preserve_case: true)}-#{data_report_job.id}.xlsx"
    end

    def campaigns
      campaign_ids = config['campaign_ids']
      campaign_ids = if campaign_ids.blank?
                       Project.where(id: config['project_ids']).map(&:project_campaign_ids).flatten
                     end

      @campaigns ||= ::Campaign.where(id: campaign_ids)
    end

    def data_report
      @data_report ||= ::DataReport.find_by(id: record.data['data_report_id'])
    end

    def config
      @config ||= JSON.parse(data_report.configuration)
    end

    def data_report_job
      @data_report_job ||= ::DataReportJob.find_by(id: record.data['data_report_job_id'])
    end

    def client
      @client ||= ::Client.find_by(id: record.data['client_id'])
    end

    def valid?
      return false if data_report.blank? || data_report_job.blank?

      true
    end
  end
end
