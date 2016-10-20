Rails.application.routes.draw do
  # default_url_options domain: Settings.domain, subdomain: false

  mount ActionCable.server => '/cable'
  devise_for :users,
             path: 'users',
             as: :devise,
             name: :user,
             singular: :user,
             to: 'User',
             class_name: 'User',
             controllers: { registrations: 'users/registrations' }

  namespace :administration do
    root to: 'home#index'
    resource :profiles

    scope module: :administrator do
      resource :sessions, only: [:new, :create], path_names: { new: 'sign_in', destroy: 'sign_out' }, as: :session do
        delete 'sign_out', to: 'sessions#destroy', as: :destroy
      end
      resource :passwords, as: :password
      resource :invitations, only: [:update], as: :invitation do
        get 'accept', to: 'invitations#edit'
      end
    end

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
        resource :designs, only: [:edit, :update]
        resources :reports, only: [:index]
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
        get :preview
      end
    end

    resources :libraries

    put '/factors_norms/update', to: 'factors_norms#update'
  end

  namespace :managers do
    resources :dashboard, only: [:index] do
    end
    resources :assigns, only: [:index] do
    end
    resources :notifications, only: [:index] do
    end
    resources :users, only: [:index] do
    end
  end

  resources :assessments, only: [:index] do
    member do
      get :pass
    end
  end

  resources :reports, only: [:show] do
  end

  resources :assigns, only: [:update]
  get 'survey_instructions', to: 'home#survey_instructions'
  root to: 'assessments#index'
end
