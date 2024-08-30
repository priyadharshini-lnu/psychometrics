# frozen_string_literal: true

# TODO: Remove this file. It is no longer needed.
module DataMigration
  module Projects
    # rubocop:disable Metrics/ClassLength
    class Migrate < Rectify::Command
      private_attr_reader :project, :out_stack, :logger

      delegate :log, to: :logger

      def initialize(project_id, level = 0, out = $stdout)
        @project = Client.find_by(ancestry_depth: 1, id: project_id)
        @out_stack = { campaigns: [] }

        @logger = DataMigration::Logger.new('Project', project_id, level, out)
      end

      def call
        return broadcast(:invalid, 'Project Not Found') if project.nil?
        return broadcast(:rejected, 'Already Migrated') if project.migrated?

        log 'preparing to migrate'
        transaction do
          subjects = case project.applicable_level
                       when 'project'
                         [project]
                       when 'campaign'
                         Client.campaigns_of(project.id)
                       when 'sub_campaign'
                         Client.sub_campaigns_of(project.id)
                     end

          subjects.each { |subject| migrate(subject) }

          log('done.')
          log('updating migration status...')

          project.update_attribute(:migrated, true)
        end

        log('Project migration complete.')
        log("(success) campaigns with id(s): #{out_stack[:campaigns].join(', ')} created.")
        broadcast(:ok)
      rescue ActiveRecord::RecordInvalid
        broadcast(:error)
      end

      private

      def migrate(subject)
        campaign = Campaign.find_by(id: subject.id)
        return log("Campaign with id #{subject.id} was already migrated") if campaign

        log("migrating #{subject.depth_symbol} (#{subject.id})")
        change_applicable_level_of_project
        create_campaign(subject)
        create_campaign_users(subject)
        create_campaign_reports(subject)
        create_campaign_assessments(subject)
        migrate_assigns(subject)
        migrate_registration_codes(subject)
        set_campaign_user_status
      end

      def change_applicable_level_of_project
        project.update(applicable_level: 'campaign') if project.applicable_level == 'project'
      end

      def create_campaign(subject)
        log('creating new campaign')
        campaign = Campaign.new(
          id: subject.id,
          project_id: subject.project.id,
          name: subject.name,
          type: 'common'
        )

        campaign.name = [subject.parent.name, subject.name].join(' - ') if subject.sub_campaign?
        campaign.status = if subject.disabled?
                            'archived'
                          else
                            'active'
                          end

        campaign.save!
        out_stack[:campaigns].push(campaign.id)
      end

      # Migrate Memberships
      # Create CampaignUser for each Membership directly linked to the Campaign
      def create_campaign_users(subject)
        log('creating campaign users')
        memberships = subject.memberships
        memberships.each do |membership|
          campaign_user = CampaignUser.new(
            campaign_id: subject.id,
            user_id: membership.user_id,
            active: !membership.disabled
          )
          campaign_user.save!
          membership_with_result = membership.membership_with_result
          update_hogan_credential(membership_with_result)
          update_privacy_consents(membership_with_result)
        end
      end

      def update_hogan_credential(membership)
        log('updating hogan credentials...', logger.level + 1)
        return unless membership.hogan_credential

        membership.hogan_credential.update_attribute(:user_id, membership.user_id, membership_id: nil)
      end

      def update_privacy_consents(membership)
        log('updating privacy consent...', logger.level + 1)
        return unless membership.privacy_consents

        membership.privacy_consents.each { |p| p.update_attribute(:user_id, membership.user_id) }
      end

      # Migrate ClientsReport
      # Create a CampaignReport for each ClientsReport directly linked to the Campaign
      def create_campaign_reports(subject)
        log('creating campaign reports')
        subject.clients_reports.each do |clients_report|
          CampaignReport.create!(
            report_id: clients_report.report_id,
            report_family_id: clients_report.report_family_id,
            campaign_id: subject.id,
            user_access: clients_report.user_access
          )
        end
      end

      # Migrate AssesmentsClients
      # For each AssessmentsClient create a CampaignAssessment
      def create_campaign_assessments(subject)
        log('creating campaign assessments')
        subject.assessments_clients.each do |assessments_client|
          CampaignAssessment.create!(
            assessment_id: assessments_client.assessment_id,
            campaign_id: subject.id,
            position: assessments_client.position,
            enable_universal_links: assessments_client.enable_universal_links,
            assessment_key: assessments_client.assessment_key,
            key_generated_at: assessments_client.key_generated_at,
            key_expires_at: assessments_client.key_expires_at
          )
        end
      end

      # Migrate Assigns
      # For each assign:
      # - Create UsersResult if not already created for this Assign
      # - Create UserAssessment
      # - Migrate AssignsReports
      def migrate_assigns(subject)
        log('migrating assigns...')
        subject.assigns.each do |assign|
          create_user_assessment(assign, subject)
          migrate_assigns_reports(assign, subject)
        end
      end

      def create_user_assessment(assign, subject)
        log('creating user assessment', logger.level + 1)
        users_result = create_users_result(assign)
        assign_with_result = assign.assign_with_result
        norm_id = assign_with_result.norm_data.fetch('id', nil) if assign_with_result.norm_data

        user_assessment = UserAssessment.new(
          assign_with_result.slice(
            :status, :started_at, :completed_at, :reset_count, :expiry_date, :selected_locale, :additional_time,
            :last_activity_at
          ).merge(
            campaign_id: subject.id,
            subject_id: assign.membership.user_id,
            evaluator_id: assign.membership.user_id,
            assessment_id: assign.assessment_id,
            users_result_id: users_result.id,
            norm_id: norm_id
          )
        )
        user_assessment.save!

        create_mindmill_credentials(assign, users_result)
        associate_users_result_with_agile_events(assign, users_result)
        associate_users_result_with_media_responses(assign, users_result)
      end

      def create_users_result(assign)
        assign_with_result = assign.assign_with_result

        log('creating user result', logger.level + 1)
        attrs = %w[
          occupations innovation_styles
          embedded_data scoring step current_element
          current_page seedrandom meta_data external_results
        ]
        attributes = assign_with_result.attributes.slice(*attrs)
        attributes['answers'] = assign_with_result.results

        users_result = UsersResult.new(attributes)
        users_result.save!

        users_result
      end

      def create_mindmill_credentials(assign, users_result)
        return if assign.mindmill_prefix.blank?

        log("creating mindmill credentials for assign##{assign.id}", logger.level + 1)
        users_result.create_mindmill_credential({
          user_name: "#{assign.mindmill_prefix}#{assign.id}",
          password: 'default'
        })
      end

      def associate_users_result_with_agile_events(assign, users_result)
        log('associating agile events with users result', logger.level + 1)
        assign.assign_with_result.agile_events.each do |agile_event|
          agile_event.update_attribute(:users_result_id, users_result.id)
        end
      end

      def associate_users_result_with_media_responses(assign, users_result)
        log('associating media responses and users result', logger.level + 1)
        assign.assign_with_result.media_responses.each do |media_response|
          media_response.update_attribute(:users_result_id, users_result.id)
        end
      end

      # Create UserReport for each AssignsReport
      def migrate_assigns_reports(assign, subject)
        log('creating user reports')
        assign.assigns_reports.each do |assigns_report|
          if UserReport.exists?(
            user_id: assign.membership.user_id,
            campaign_id: subject.id,
            report_id: assigns_report.report_id
          )
            next
          end

          pdf_details = get_pdf_details(assign, assigns_report)
          user_report = UserReport.new(
            pdf_path: pdf_details['pdf_path'],
            report_id: assigns_report.report_id,
            user_id: assign.membership.user_id,
            campaign_id: subject.id,
            user_access: assigns_report.user_access
          )

          report_statuses = [assigns_report.external_report.url, assigns_report.pdf.url]
          user_report.status = if assigns_report.generating?
                                 'generating'
                               elsif report_statuses.any?
                                 'prepared'
                               else
                                 'not_prepared'
                               end

          user_report.save!
          user_report.update_column(:pdf, pdf_details['pdf'])
        end
      end

      def get_pdf_details(assign, assigns_report)
        pdf, pdf_path = nil

        if assigns_report.report.hogan? && assigns_report.external_report.present?
          pdf_path = "uploads/assigns_report/external_report/#{assigns_report.id}"
          pdf = assigns_report.read_attribute(:external_report)
        elsif assigns_report.report.mindmill? && assign.mindmill_report.present?
          pdf_path = "uploads/assigns/mindmil_report/#{assign.id}"
          pdf = assign.read_attribute(:mindmill_report)
        elsif assigns_report.report.provider_internal? && assigns_report.pdf.present?
          pdf_path = "uploads/assigns_report/pdf/#{assigns_report.id}"
          pdf = assigns_report.read_attribute(:pdf)
        end

        HashWithIndifferentAccess.new(pdf: pdf, pdf_path: pdf_path)
      end

      def migrate_registration_codes(subject)
        campaign_id = out_stack[:campaigns].last
        log("migrating registration codes of subject #{subject.id}...")

        subject.registration_codes.each { |code| code.update_attribute(:campaign_id, campaign_id) }
      end

      def set_campaign_user_status
        CampaignUser.where(campaign_id: out_stack[:campaigns].last).find_each do |campaign_user|
          user_assessments = UserAssessment.where(
            subject_id: campaign_user.user_id,
            evaluator_id: campaign_user.user_id,
            campaign_id: campaign_user.campaign_id
          ).includes(:users_result)

          started_at = user_assessments.filter_map(&:started_at).min
          all_assessments_completed = user_assessments.all?(&:completed?)
          no_assessments_started = user_assessments.all?(&:not_started?)

          completion_status = :in_progress
          completion_status = :completed if all_assessments_completed
          completion_status = :not_started if no_assessments_started

          campaign_user.update(started_at: started_at, completion_status: completion_status, status: completion_status)
        end
      end
    end
    # rubocop:enable Metrics/ClassLength
  end
end
