Rails.application.routes.draw do
  resources :people, except: [:show]

  root to: "people#index"
end