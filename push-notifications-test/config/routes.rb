Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root to: 'pages#home'

  post '/push' => 'push_notifications#create'

  get '/get_data' => 'data#get_data'

  post '/send_to_db' => 'data#save_subscription'

  post '/delete_subscription' => 'data#delete_subscription'

  post '/webhook/product_created' => 'data#product_created'
end
