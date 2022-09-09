# frozen_string_literal: true

class EndUser::UsersController < ApplicationController
  include ::Threesixty::InitialState
  layout 'layouts/end_user'
  before_action :skip_policy_scope
  before_action :set_locale, except: %i[change_locale]
  before_action :single_assigns, except: %i[change_locale]
  initial_state_for %i[dashboard]
  skip_before_action :authenticate_user!, only: %i[change_locale]

  def show
    redirect_to new_user_session_path
  end

  # rubocop:disable Metrics/AbcSize
  def dashboard # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
    return render 'end_user/users/dashboard' if show_new_end_user_view?

    subject_campaigns = Threesixty::Subject.where(user_id: current_user.id).pluck(:campaign_id)
    evaluator_campaigns = Threesixty::Evaluator.where(user_id: current_user.id).pluck(:campaign_id)
    user_campaigns = current_user.campaign_users.where(active: true).pluck(:campaign_id) |
                     subject_campaigns | evaluator_campaigns

    campaigns = ::Campaign.where(id: user_campaigns).visible_to_end_user.
                includes(:threesixty_campaign).group_by(&:type)

    respond_to do |format|
      format.html do
        redirect_to select_campaign_url(campaigns.values.flatten.first) if campaigns.values.flatten.size == 1
      end
      format.json do
        json = @single_assigns.uniq.filter_map do |assign|
          next if assign.membership.client.migrated?

          applicable_level_project = assign.membership.client.applicable_level == 'project'

          next if applicable_level_project && assign.membership.disabled?
          next if !applicable_level_project && assign.original_assigns.all? { |a| a.membership&.disabled? }

          ::EndUser::AssignSerializer.new(assign).to_h
        end

        json.concat(serializer_campaign(campaigns['common'], ::EndUser::ShortCampaignSerializer)) if campaigns['common']

        if campaigns['threesixty']
          json.concat(serializer_campaign(campaigns['threesixty'].map(&:threesixty_campaign),
                                          Threesixty::CampaignSerializer))
        end

        render json: json
      end
    end
  end
  # rubocop:enable Metrics/AbcSize

  def switch_end_user_view
    cookies[:end_user_view] = params[:view] == 'new' ? 'new' : 'old'

    redirect_to root_path
  end

  def accept_privacy
    current_user.create_privacy_consent!
    head :ok
  end

  def change_locale
    cookies[:locale] = params[:locale] if @current_project.available_locales.include?(params[:locale])
    set_locale
    current_user&.update_column(:locale, I18n.locale)
  end

  def update_details
    form = Users::ProfileForm.from_params(params[:user]).with_context(user: current_user, project: @current_project)
    return render json: { errors: form.errors.messages }, status: 400 unless form.valid?

    if current_user.update(form.attributes.except(*UserProfile::PROFILE_FIELDS))
      current_user.user_profile.update!(form.attributes.slice(*UserProfile::PROFILE_FIELDS))
      bypass_sign_in(current_user, scope: :user)
      render json: current_user, serializer: Threesixty::CurrentUserSerializer, project_id: @current_project.id
    else
      render json: { errors: current_user.errors.messages }, status: 400
    end
  end

  def upload_photo
    if current_user.user_profile.update(photo: params[:photo])
      render json: { photo: current_user.user_profile.photo&.url }
    else
      render json: { errors: current_user.user_profile.errors.messages }, status: 400
    end
  end

  private

  def select_campaign_url(campaign)
    if campaign.threesixty?
      "/threesixty_campaigns/#{campaign.threesixty_campaign.id}"
    else
      campaign_path(campaign)
    end
  end

  def serializer_campaign(campaigns, serializer)
    campaigns.map do |campaign|
      serializer.new(campaign, current_user: current_user, include: '**').to_h
    end
  end

  def single_assigns
    @single_assigns = []
    return @single_assigns unless @current_membership

    @single_assigns = policy_scope(Assign).
                      includes(:single_reports, membership: :client, original_assign: %i[membership single_reports]).
                      joining { original_assign.outer.membership.outer.client.outer }.
                      joins(
                        'LEFT OUTER JOIN "assessments_clients"
                        ON "assessments_clients"."client_id" = "clients"."id"
                        AND "assessments_clients"."assessment_id" = "assigns"."assessment_id"'
                      ).
                      order('assessments_clients.position ASC').
                      preload(:assessment)
  end
end
