# frozen_string_literal: true

module Administration
  class ProfilesController < Administration::BaseController
    skip_before_action :enforce_geo_restriction
    before_action :set_profile, only: %i[edit update]
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), :admin_path

    def edit
      authorize user, nil, policy_class: UserProfilePolicy
      @form = ::Users::AdminProfileEditForm.from_model(user)
    end

    def update
      authorize user, nil, policy_class: UserProfilePolicy
      @form = ::Users::AdminProfileEditForm.from_params(profile_params).with_context(current_user: current_user)
      return render :edit unless @form.valid?

      @user = ::Users::AdminProfileUpdate.call!(@form, current_user)
      @form.errors.merge!(@user.errors)
      if @form.errors.blank?
        audit! :update_profile, @user, payload: params.expect(user: %i[first_name last_name email])
        if password_change?
          sign_out(current_user)
          return redirect_to root_path, notice: t('users.password_change_success')
        end

        redirect_to edit_administration_profiles_path, notice: t('.edit.success')
      else
        render :edit
      end
    end

    private

    def set_profile
      @_user = current_user
    end

    def profile_params
      unless password_change?
        params[:user].delete(:password)
        params[:user].delete(:password_confirmation)
      end
      params.expect(
        user: %i[first_name last_name email
                 password password_confirmation weekly_license_stats change_password current_password]
      ).merge(id: current_user.id)
    end

    def password_change?
      params[:user][:change_password] == 'true'
    end
  end
end
