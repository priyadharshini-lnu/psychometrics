# frozen_string_literal: true

module AdminJobs
  module DataReportHandlers
    class JsonDataReportHandler < BaseHandler
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

      def generate_file
        workbook = FastExcel.open(file_path, constant_memory: true)

        worksheet = workbook.add_worksheet
        build_sections(worksheet, workbook)
        write_rows(worksheet, workbook)

        workbook.close
      end

      def self.file_extension
        'xlsx'
      end

      private

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
    end
  end
end
