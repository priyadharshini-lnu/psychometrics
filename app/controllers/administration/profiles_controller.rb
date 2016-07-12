class Administration::ProfilesController < Administration::BaseController
  before_action :set_profile, only: [:edit, :update]
  add_breadcrumb I18n.t('administration.breadcrumbs.home'), :administration_root_path

  # GET /administration/users/1/edit
  def edit
    authorize @user
  end


  # PATCH/PUT /administration/users/1
  def update
    authorize @user
    respond_to do |format|
      if @user.update(profile_params)
        sign_in :administrator, @user, bypass: true
        format.html { redirect_to edit_administration_profiles_path, notice: t('.edit.success') }
      else
        format.html { render :edit }
      end
    end
  end

  private

  def set_profile
    @user = current_administrator
  end

  def profile_params
    params.require(:user).permit(:first_name, :last_name, :email, :password)
  end
end
