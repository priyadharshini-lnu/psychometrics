# frozen_string_literal: true

module Devtools
  module CLI
    module Commands
      class AssignUserReport < Base # rubocop:disable Metrics/ClassLength
        attr_reader :script_id

        desc 'Assign report to user in campaign'
        option :campaign_id, desc: 'Campaign ID where user needs to be assigned report in'
        option :user_id, desc: 'Existing User ID (leave empty to create new user)'
        option :report_id, desc: 'Existing Report ID (leave empty to create new report)'
        option :assessment_id, desc: 'Existing Assessment ID (leave empty to create new assessment)'

        def call(campaign_id: nil, user_id: nil, report_id: nil, assessment_id: nil, **)
          @script_id = "Scr#{SecureRandom.hex(2)}"
          cli_log "Script ID: #{script_id}"

          cli_log "\nAssign User Report Tool"
          cli_log "========================\n\n"

          # Ask for campaign ID if not provided
          unless campaign_id
            cli_log 'Please provide [Campaign ID] where user needs to be assigned report in: '
            campaign_id = $stdin.gets.chomp
          end

          campaign = Campaign.find_by(id: campaign_id)
          unless campaign
            cli_log "\nError: Campaign with ID #{campaign_id} not found."
            exit
          end

          cli_log "Selected campaign: #{campaign.name}"
          project = campaign.project
          client = project.client

          # User selection or creation
          user = handle_user(user_id, campaign)

          # Add user to campaign if not already a member
          campaign_user = handle_campaign_user(campaign, user)

          # Report selection or creation
          report, new_report_created = handle_report(report_id, client)

          # Ensure assessment is associated with report
          if new_report_created
            assessment = handle_assessment(assessment_id, report, client, user)
            report.modules.update_all(assessment_id: assessment.id) if assessment
            report.provider = 'internal'
            report.assessments << assessment if assessment && report.assessments.exclude?(assessment)
            report.save!
          end

          # Find or create license and report family
          report_family = handle_report_family(report, client)

          # Assign report to user
          assign_report_to_user(campaign_user, report, report_family)
        end

        private

        def handle_user(user_id, campaign)
          if user_id.nil?
            cli_log "\nIf you want to create new user enter 'n' or enter [User ID]: "
            user_input = $stdin.gets.chomp.downcase
          else
            user_input = user_id
          end

          if user_input == 'n'
            user = User.new(
              email: "#{script_id}_email@example.com",
              first_name: "#{script_id}FirstName",
              last_name: "#{script_id}LastName",
              project_id: campaign.project_id
            )
            strong_password = user.generate_strong_password
            user.password = strong_password
            user.password_confirmation = strong_password
            user.role = User::REGULAR_ROLE

            if user.save
              cli_log "Created new user: #{user.email} #{user.name} (ID: #{user.id})"
            else
              cli_log "\nError creating user: #{user.errors.full_messages.join(', ')}"
              exit
            end
          else
            # Use existing user
            user = User.find_by(id: user_input, project_id: campaign.project_id)
            unless user
              cli_log "\nError: User with ID #{user_input} not found in project #{campaign.project.name}."
              exit
            end
            cli_log "Selected user: #{user.name} (ID: #{user.id})"
          end
          user
        end

        def handle_campaign_user(campaign, user)
          campaign_user = CampaignUser.find_by(campaign: campaign, user: user)
          if campaign_user
            cli_log 'User already exists in campaign'
          else
            campaign_user = CampaignUser.create!(campaign: campaign, user: user)
            cli_log "Added user to campaign. Campaign User ID: #{campaign_user.id}"
          end
          campaign_user
        end

        def handle_report(report_id, client)
          new_report_created = false
          if report_id.nil?
            cli_log "\nIf you want to create new report enter 'n' or enter [Report ID]:"
            report_input = $stdin.gets.chomp.downcase
          else
            report_input = report_id
          end

          super_admin = Users::SuperAdmin.where(disabled: false).last

          if report_input == 'n'
            report = Report.new(name: "#{script_id} Report",
                                owner_id: client.id,
                                created_by: super_admin,
                                updated_by: super_admin,
                                skip_owner_validation: true,
                                category: Assessment::CATEGORIES[:common],
                                provider: 'custom_upload',
                                extra: { 'icon_color' => '#845EC2' })

            if report.save
              cli_log "Created new report: #{report.name} (ID: #{report.id})"
              page = report.pages.create!(name: "#{script_id} Page", position: 1)
              page.modules.create!(
                'name' => nil,
                'props' =>
                  { 'sourceType' => 'Text',
                    'position' => { 'left' => 368, 'top' => 591, 'width' => 104, 'height' => 58 },
                    'style' => {
                      'fontColor' => '#333333', 'fontWeight' => 'normal', 'fontStyle' => 'normal',
                      'fontSize' => '100%', 'fontFamily' => '', 'verticalAlign' => '', 'horizontalAlign' => 'center',
                      'textAlign' => '', 'alignItems' => '', 'color' => '#333333'
                    },
                    'zIndex' => 3000,
                    'text' => "<p>#{script_id} Text module</p>",
                    'textConditions' => [],
                    'styleIds' => ['header_6'] },
                'position' => 1,
                'type' => 'Text',
                'meta' => {}
              )
              new_report_created = true
            else
              cli_log "\nError creating report: #{report.errors.full_messages.join(', ')}"
              exit
            end
          else
            # Use existing report
            report = Report.find_by(id: report_input)
            unless report
              cli_log "\nError: Report with ID #{report_input} not found."
              exit
            end
            cli_log "Selected report: #{report.name} (ID: #{report.id})"
          end
          [report, new_report_created]
        end

        def handle_assessment(assessment_id, report, client, user)
          if assessment_id.nil?
            cli_log "\nIf you want to create new assessment enter 'n'. If you want to attach existing assessment to the report, then enter [Assessment Id]: " # rubocop:disable Layout/LineLength
            assessment_input = $stdin.gets.chomp
          else
            assessment_input = assessment_id
          end

          if assessment_input.downcase == 'n'
            assessment = create_new_assessment(client, user)
          else
            # Use existing assessment
            assessment = Assessment.find_by(id: assessment_input)
            unless assessment
              cli_log "\nError: Assessment with ID #{assessment_input} not found."
              exit
            end

            unless report.assessments.include?(assessment)
              cli_log 'Added assessment to report'
            end

            cli_log "Selected assessment: #{assessment.name} (ID: #{assessment.id})"
          end
          assessment
        end

        def create_new_assessment(client, user)
          assessment = Assessment.new(name: "#{script_id} Assessment",
                                      owner_id: client.id,
                                      created_by: user,
                                      updated_by: user,
                                      skip_owner_validation: true,
                                      dimension_id: Dimension.last.id,
                                      type: Assessment::TYPES[:common],
                                      category: Assessment::CATEGORIES[:psychometric],
                                      norm_rules: [])

          if assessment.save
            cli_log "Created new assessment: #{assessment.name} (ID: #{assessment.id})"
            block = assessment.blocks.create!(
              'name' => "#{script_id} Block",
              'position' => 1,
              'props' =>
                { 'randomization' => { 'type' => 'All', 'questions' => '' },
                  'buttons' => { 'prev_button' => 'Previous', 'next_button' => 'Next' } }
            )
            # rubocop:disable Metrics/BlockLength
            2.times.each do |i|
              attrs = {
                'name' => "#{script_id} Question #{i + 1}",
                'position' => i + 1,
                'type' => 'MultipleChoice',
                'props' =>
                  {
                    'choices' => 2,
                    'choicesTexts' => %w[English Arabic],
                    'choicesImages' => ['', '', ''],
                    'questionText' => 'Select your language preference',
                    'type' => 'Dropdown',
                    'position' => 'Vertical',
                    'defaultValues' => [],
                    'notApplicable' => false,
                    'notApplicableLabel' => 'Not Applicable',
                    'withImageChoice' => false,
                    'isImagePreviewEnable' => false,
                    'imageChoiceSize' => 'small',
                    'randomization' => { 'type' => 'All' }
                  },
                'block_id' => block.id,
                'required_validation' => { 'enabled' => true, 'type' => 'Request' },
                'validation' => { 'type' => 'None', 'args' => {} },
                'skip_logic' => [],
                'assessment_id' => assessment.id,
                'owner_id' => assessment.owner_id
              }
              Question.create!(attrs)
            end
            # rubocop:enable Metrics/BlockLength
          else
            cli_log "\nError creating assessment: #{assessment.errors.full_messages.join(', ')}"
            exit
          end
          assessment
        end

        def handle_report_family(report, client)
          license = report.report_families.filter_map do |report_family|
            licenses = Licenses::FetchQuery.new(client, report_family.id).query
            licenses.detect(&:enough_licenses?)
          end.last

          if license
            report_family = license.report_family
            cli_log "Using existing license for report family (Report family name: #{license.report_family.name})"
          else
            cli_log 'No existing license found for report family, creating a new one.'
            report_family = report.report_families.create!(name: "#{script_id} Report Family")
            License.create!(
              client: client,
              report_family_id: report_family.id,
              start_date: Time.current,
              end_date: 1.year.from_now,
              number: 100,
              overuse_number: 0,
              used_number: 0
            )
            cli_log "Created new report family: #{report_family.name} (ID: #{report_family.id})"
          end

          # Create report family if it doesn't exist
          unless report_family
            report_family = ReportFamily.create(name: "Family for #{report.name}")
            report.report_families << report_family
            cli_log "Created new report family: #{report_family.name} (ID: #{report_family.id})"
          end

          report_family
        end

        def assign_report_to_user(campaign_user, report, report_family)
          result = Campaigns::Users::AddReport.call!(
            campaign_user,
            report,
            assessments: report.assessments,
            report_family_id: report_family.id,
            operation: 'add_and_allow_new_response'
          )

          if result[:user_report]
            cli_log "\nSuccessfully assigned report to user!"
            cli_log "User Report ID: #{result[:user_report].id}"
          else
            cli_log "\n Something went wrong while assigning report to user. #{result[:error]}"
          end
        rescue StandardError => e
          cli_log "\nError assigning report to user: #{e.message}"
        end
      end
    end
  end
end
