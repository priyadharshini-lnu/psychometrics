# frozen_string_literal: true

module Threesixty
  module Campaigns
    class CreateEmptyCampaign < BaseCommand
      private_attr_reader :threesixty_campaign, :project, :client, :user, :resource_name, :form

      def initialize(form, project, user, resource_name:)
        @threesixty_campaign = ::Threesixty::Campaigns::Build.call!(form, project)
        @project = project
        @client = project.client
        @user = user
        @resource_name = resource_name
        @form = form
      end

      def call
        assessment = Assessment.new(name: resource_name,
                                    owner_id: client.id,
                                    created_by: user,
                                    updated_by: user,
                                    skip_owner_validation: true,
                                    dimension_id: dimension.id,
                                    type: Assessment::TYPES[:common],
                                    category: Assessment::CATEGORIES[:threesixty])
        assessment.set_default_color
        assessment.save!
        report = Report.new(name: resource_name,
                            owner_id: client.id,
                            created_by: user,
                            updated_by: user,
                            skip_owner_validation: true,
                            assessment_id: assessment.id,
                            category: Assessment::CATEGORIES[:threesixty])
        report.set_default_color
        report.assessments << assessment
        report.provider = 'internal'
        report.save!
        threesixty_campaign.assessment_id = assessment.id
        threesixty_campaign.report_id = report.id
        threesixty_campaign.save!

        broadcast :ok, threesixty_campaign
      end

      private

      def dimension
        @dimension ||= if form.skills_rater?
                         Dimension.skills_rater_dimension(project)
                       else
                         Dimension.create!(
                           name: resource_name,
                           created_by: user,
                           updated_by: user,
                           skip_owner_validation: true,
                           owner_id: client.id
                         )
                       end
      end
    end
  end
end
