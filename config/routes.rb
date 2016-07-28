Rails.application.routes.draw do
  mount ActionCable.server => '/cable'
  devise_for :administrators, path: 'administration/administrators', as: :devise,
             name: :administrator, singular: :administrator, to: 'User',
             class_name: 'User'
  devise_for :users, path: 'users', as: :devise,
             name: :user, singular: :user, to: 'User',
             class_name: 'User'

  namespace :administration do
    root to: 'home#index'
    resource :profiles

    resources :imports, only: [:new, :create]

    ### ASSESSMENTS
    resources :assessments do
      member do
        get :copy
        get :sidebar
        patch :toggle_status
      end
    end
    ### END ASSESSMENTS

    ### DIMENSIONS
    resources :dimensions do
      member do
        get :copy
        get :sidebar
        patch :toggle_status
      end
      ### FACTORS
      resources :factors do
        member do
          get :copy
          get :sidebar
          patch :toggle_status
        end
        ### SUB-FACTORS
        resources :sub_factors do
          member do
            get :sidebar
          end
        end
        ### END SUB-FACTORS
      end
      ### END FACTORS
    end
    ### END DIMENSIONS

    ### USERS
    resources :users do
      member do
        patch :toggle_status
        get :sidebar
        get :reset_password
        get :spoof
      end
      collection do
        get :export
      end
    end
    ### END USERS

    ### NORMS
    resources :norms do
      member do
        get :copy
        patch :toggle_status
        get :sidebar
        get :editor
        get :export
      end
    end
    ### END NORMS

    resources :factors_norms
    resources :surveys
  end

  root to: 'home#index'
end
