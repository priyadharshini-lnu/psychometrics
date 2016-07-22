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

    resources :dimensions do
      member do
        get :copy
        get :sidebar
        patch :toggle_status
      end
      resources :factors do
        member do
          get :copy
          get :sidebar
          patch :toggle_status
        end
        resources :sub_factors do
          member do
            get :sidebar
          end
        end
      end
    end

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

    resources :norms do
      member do
        get :copy
        patch :toggle_status
        get :sidebar
      end
    end
    resources :surveys
  end

  root to: 'home#index'
end
