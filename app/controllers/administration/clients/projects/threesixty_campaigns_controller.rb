# frozen_string_literal: true

module Administration
  module Clients
    module Projects
      class ThreesixtyCampaignsController < Administration::ThreesixtyCampaigns::BaseController
        include Administration::Clients
        before_action :ensure_project
        prepend_before_action :set_resource_class
        before_action :set_resource, only: %i[show edit update sidebar toggle_status copy archive export_results]
        before_action :set_campaign_template_and_assessments, only: %i[new create]
        wrap_parameters :threesixty_campaign

        def index
          @filter_term = params.dig(:q, :filterable_fields)
          @_filter_form = project.project_campaigns.
                          where(type: 'threesixty').
                          includes(
                            :threesixty_campaign,
                            threesixty_campaign: %i[assessment report]
                          ).
                          ransack(params[:q])
          @_resources = filter_form.result.page(params[:page])

          respond_to do |format|
            format.html
            format.js { render :index, formats: [:js] }
          end
        end

        def show
          @init_state ||= {}
          @init_state.merge!({
            project: {
              datasheetFields: resource.datasheet_column_names,
              relationships: ::Relationships::ByCampaign.new(resource.campaign).to_a
            },
            threeSixtyCampaign: {
              campaignDetails: {
                id: resource.id,
                name: resource.name,
                campaignId: resource.campaign_id,
                reportId: resource.report_id,
                reportName: resource.report.name,
                reportIcon: resource.report.icon&.url,
                reportAvailableLanguages: resource.campaign_report.available_languages,
                reportDefaultLanguage: resource.campaign_report_default_locale,
                assessmentId: resource.assessment_id,
                dimensionId: resource.assessment.dimension_id,
                options: {
                  participants: resource.option.participants
                },
                campaignReportPermissions: campaign_report_permissions,
                campaignAssessmentPermissions: campaign_assessment_permissions
              }
            },
            currentUser: serialized_current_user,
            config: {
              availableLocales: I18n.available_locales,
              features: feature_flags
            },
            datasheet: {
              parentResource: { type: 'new_campaign', id: resource.campaign_id }
            }
          })
        end

        def new
          @campaign_template_and_assessment_ids = CampaignTemplate.pluck(:id, :assessment_id).to_h
          @form = ::Threesixty::Campaigns::CreateForm.new
        end

        def create
          @form = ::Threesixty::Campaigns::CreateForm.from_params(params[:resource])
          if @form.valid?
            @_resource = ::Threesixty::Campaigns::Create.call!(project, @form, current_user)
          else
            @campaign_template_and_assessment_ids = CampaignTemplate.pluck(:id, :assessment_id).to_h
            render 'new'
          end
        end

        def update
          @form = ::Threesixty::Campaigns::UpdateForm.from_params(params[:resource])
          if @form.valid?
            @_resource = threesixty_campaign.campaign
            threesixty_campaign.campaign.update(@form.attributes)
          else
            render 'edit'
          end
        end

        def factors
          @factors = if params[:assessment_id].present?
                       assessment = Assessment.find(params[:assessment_id])
                       assessment.dimension.all_factors
                     else
                       []
                     end
        end

        def destroy
          @campaign = project.project_campaigns.find(params[:id])
          ::Campaigns::Remove.call(@campaign) do
            on(:error) { |errors| @campaign.errors.add(:base, errors) }
          end
          @_resource = @campaign
          respond_to(&:js)
        end

        def i18n
          'clients.threesixty_campaigns'
        end

        private

        def campaign_params
          params.require(:resource).permit(:name)
        end

        def threesixty_campaign_params
          params.require(:resource).require(:threesixty_campaign).permit(:assessment_id, factors: [])
        end

        def set_resource_class
          @_resource_class ||= ::Threesixty::Campaign # rubocop:disable Naming/MemoizedInstanceVariableName
        end

        def threesixty_campaign
          @threesixty_campaign ||= ::Threesixty::Campaign.find_by(id: params[:id])
        end

        def serialized_current_user
          ::Administration::Threesixty::CurrentUserSerializer.new(
            context: { project_id: project.id, campaign_id: threesixty_campaign.campaign_id }
          ).serialize(current_user).deep_transform_keys! { |key| key.to_s.camelize(:lower) }
        end

        def set_campaign_template_and_assessments
          @assessments = project.project_campaigns.where(type: 'threesixty').
                         map(&:threesixty_campaign).map(&:assessment) # rubocop:disable Performance/MapMethodChain
          @campaign_templates = CampaignTemplate.all
        end

        def campaign_assessment_permissions
          GetPermissionsHash.call!(
            Administration::Threesixty::CampaignPolicy,
            current_user,
            nil,
            %w[edit_assessment],
            project_id: project.id
          ).transform_keys! { |k| k.camelcase(:lower) }
        end

        def campaign_report_permissions
          permissions = GetPermissionsHash.call!(
            Administration::Threesixty::CampaignPolicy,
            current_user,
            nil,
            %w[
              manage_reports_options
            ],
            {
              project_id: project.id,
              campaign_id: threesixty_campaign.campaign_id
            }
          )
          permissions.transform_keys! { |k| k.camelcase(:lower) }
        end
      end
    end
  end
end
