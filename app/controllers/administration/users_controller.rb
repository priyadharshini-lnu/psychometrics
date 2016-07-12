class Administration::UsersController < Administration::BaseController
  before_action :set_user, only: [:show, :edit, :update, :destroy]
  add_breadcrumb I18n.t('administration.breadcrumbs.home'), :administration_root_path

  # Skip verify_policy_scoped defined in base controller
  before_action :skip_policy_scope

  # GET /administration/users
  def index
    add_breadcrumb I18n.t('administration.breadcrumbs.users'), administration_users_path
    @filterrific = initialize_filterrific(
      User,
      params[:filterrific],
      select_options: {
        with_role: User.options_for_with_role
      }) or return
    @users = @filterrific.find.page(params[:page])
  end

  # GET /administration/users/1
  def show
  end

  # GET /administration/users/new
  def new
    @user = User.new
  end

  # GET /administration/users/1/edit
  def edit
  end

  # POST /administration/users
  def create
    @user = User.new(user_params)

    respond_to do |format|
      if @user.save
        format.html { redirect_to @user, notice: 'High score was successfully created.' }
      else
        format.html { render :new }
      end
    end
  end

  # PATCH/PUT /administration/users/1
  def update
    respond_to do |format|
      if @user.update(user_params)
        format.html { redirect_to @user, notice: 'High score was successfully updated.' }
      else
        format.html { render :edit }
      end
    end
  end

  # DELETE /administration/users/1
  def destroy
    @user.destroy
    respond_to do |format|
      format.html { redirect_to users_url, notice: 'High score was successfully destroyed.' }
    end
  end

  private
    def set_user
      @user = User.find(params[:id])
    end

    def user_params
      params.require(:user).permit(:first_name, :last_name, :email, :disabled, :client_id)
    end
end
