# frozen_string_literal: true

module ActiveRecordAuditLogs
  class AssociatedRecordsResolver < BaseCommand
    MAX_RECORDS = 2000

    ASSOCIATED_RECORD = {
      'Report' => %w[pages campaign_factors campaign_ai_artifacts filters assessments_reports translations],
      'Reports::Page' => %w[modules],
      'Reports::Module' => %w[translations],
      'Reports::CampaignFactor' => %w[translations],
      'Assessment' => %w[assessments_reports blocks translations agile],
      'Block' => %w[questions translations],
      'Blocks' => %w[questions translations],
      'Question' => %w[translations factor_scorings],
      'UserAssessment' => %w[
        users_result saville_user_assessment pearson_user_assessment mettl_user_assessment
        simulation_user_assessment skillvue_user_assessment microsite_user_assessment
        yoodli_user_assessment meeting_room proctoring_sessions mhs_user_assessment
      ],
      'UsersResult' => %w[media_responses],
      'UserResult' => %w[media_responses],
      'MediaResponse' => %w[asset_attachment],
      'ActiveStorage::Attachment' => %w[blob],
      'Attachment' => %w[blob],
      'UserReport' => %w[user_report_pdfs],
      'UserReportPdf' => %w[pdf_file_attachment],
      'CampaignFactorGroup' => %w[campaign_factors],
      'Campaign' => %w[
        campaign_factor_groups campaign_ai_artifacts campaign_assessment_groups
        campaign_reports campaign_options
      ],
      'CampaignAssessmentGroup' => %w[campaign_assessments],
      'CampaignAssessment' => %w[assessment norm campaign_assessment_group],
      'CampaignUser' => %w[
        campaign_factor_values campaign_user_assessments campaign_user_ai_artifacts campaign_user_reports
      ],
      'Workshop' => %w[workshop_assessors workshop_resources],
      'WorkshopSubject' => %w[workshop user workshop_invited_subject],
      'WorkshopInvite' => %w[workshop_invited_subjects workshop_invite_logs],
      'WorkshopInvitedSubject' => %w[workshop_invite user workshop_subject reschedule_workshop],
      'WorkshopInviteLog' => %w[workshop_invite user created_by],
      'WorkshopAssessor' => %w[workshop user],
      'WorkshopResource' => %w[workshop],
      'User' => %w[user_profile],
      'AI::ScoreApproval' => %w[assessment campaign users_result],
      'AI::ScoringApprovalSetting' => %w[assessment campaign],
      'AI::ScoringApprovalNotification' => %w[assessment campaign]
    }.freeze

    SUPPORTED_RECORD_TYPES = ASSOCIATED_RECORD.keys.freeze

    def initialize(root_record)
      @root_record = root_record
    end

    def call
      broadcast :ok, resolve
    end

    private

    attr_reader :root_record

    def resolve
      visited = { identity(root_record) => true }
      discovered = [root_record]
      current_level = [root_record]

      until current_level.empty? || discovered.size >= MAX_RECORDS
        current_level = expand_level(current_level, visited, discovered)
      end

      discovered
    end

    def expand_level(current_level, visited, discovered)
      next_level = []

      current_level.group_by { |record| base_name(record) }.each do |model_name, records|
        association_names = real_associations(records.first, associations_for(model_name))
        next if association_names.empty?

        preload(records, association_names)

        records.each do |record|
          association_names.each do |association_name|
            each_associated(record, association_name) do |associated|
              key = identity(associated)
              next if visited[key]

              visited[key] = true
              discovered << associated
              next_level << associated
            end
          end
        end
      end

      next_level
    end

    def associations_for(model_name)
      [model_name, model_name.pluralize, model_name.singularize].uniq.
        flat_map { |name| ASSOCIATED_RECORD[name] || [] }.uniq
    end

    def real_associations(sample, association_names)
      association_names.select { |name| sample.class.reflect_on_association(name.to_sym) }
    end

    def preload(records, association_names)
      ActiveRecord::Associations::Preloader.new(
        records: records,
        associations: association_names.map(&:to_sym)
      ).call
    end

    def each_associated(record, association_name)
      value = record.public_send(association_name)
      return if value.nil?

      if value.respond_to?(:find_each)
        value.find_each { |associated| yield associated if associated.present? }
      else
        Array.wrap(value).each { |associated| yield associated if associated.present? }
      end
    end

    def identity(record)
      [base_name(record), record.id]
    end

    def base_name(record)
      record.class.base_class.name
    end
  end
end
