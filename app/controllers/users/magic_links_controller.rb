# frozen_string_literal: true

module Users
  class MagicLinksController < Devise::MagicLinksController
    layout 'devise'

    def show
      super do
        session[:login_via_magic_link] = true

        if valid_campaign_and_assessment?
          user_assessment = current_user.user_assessments.find_by(assessment_id: assessment_id,
                                                                  campaign_id: campaign_id)

          if user_assessment
            redirect_to user_assessment_path(user_assessment) and return
          else
            redirect_to root_path and return
          end
        elsif campaign_id.present?
          redirect_to campaign_path(campaign_id) and return
        else
          redirect_to root_path and return
        end
      end
    end

    def sign_in_link
      @magic_link_url = Utility::Url.generate(
        :user_magic_link_url,
        id: params[:id],
        subdomain: @current_project.subdomain,
        user: params[:user].permit(:email, :token, :remember_me),
        campaign_id: params[:campaign_id],
        assessment_id: params[:assessment_id]
      )
      render :sign_in_link, layout: 'empty_end_user'
    end

    def auth_options
      { scope: :user }
    end

    private

    def valid_campaign_and_assessment?
      campaign_id.present? && assessment_id.present?
    end

    def campaign_id
      params[:campaign_id]
    end

    def assessment_id
      params[:assessment_id]
    end
  end
end
