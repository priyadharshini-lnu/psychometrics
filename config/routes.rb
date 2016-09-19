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

    namespace :imports do
      resource :users, only: [:new, :create]
      resource :hris, only: [:new, :create], controller: :hris
    end

    resources :imports, only: [:new, :create]

    ### CLIENTS
    resources :clients do
      member do
        get :copy
        get :sidebar
        patch :toggle_status
        get :license
      end
      scope module: :clients do
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
      end
    end
    ### END CLIENTS

    ### ASSESSMENTS
    resources :assessments do
      member do
        get :copy
        get :sidebar
        patch :toggle_status
        get :preview
        get :reports
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

    ### TEMPLATES
    namespace :templates do
      resources :questions do
        member do
          get :copy
          get :sidebar
          patch :toggle_status
          get :new_assign
        end
      end
      resources :blocks do
        member do
          get :copy
          get :sidebar
          patch :toggle_status
          get :new_assign
          get :preview
        end
      end
    end
    ### END TEMPLATES

    resources :reports do
      member do
        get :copy
        get :sidebar
        patch :toggle_status
      end
    end

    put '/factors_norms/update', to: 'factors_norms#update'
  end

  root to: 'home#index'
end
